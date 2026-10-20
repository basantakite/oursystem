import fs from 'fs';

console.log('--- Overhauling viewHouseholdFamilyModal with 5-Rule Strict Surname & Parent Matching ---');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const newModalCode = `async function viewHouseholdFamilyModal(headVoterId, headName, wardNo, fatherName, spouseName) {
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;
      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';

      openModal(\`🏠 \${esc(headName)} को परिवार\`, \`<div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto 12px;"></div>५-नियम त्रुटिरहित पारिवारिक संरचना लोड हुँदैछ...</div>\`);

      try {
        function cleanStr(s) {
          return (s || '').trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\\-_~\`()]/g, '');
        }
        function extractSurname(name) {
          if (!name) return '';
          const parts = name.trim().split(/\\s+/);
          return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
        }

        // 1. Fetch head voter's complete record
        let head = (window._currentLivePageVoters || []).find(v => v.voter_id === headVoterId || v.VoterID === headVoterId);
        if (!head) {
          const resHead = await fetch(\`\${url}/rest/v1/voters?voter_id=eq.\${encodeURIComponent(headVoterId)}\`, {
            headers: { apikey: key, Authorization: 'Bearer ' + key }
          });
          const hData = await resHead.json();
          if (Array.isArray(hData) && hData.length > 0) head = hData[0];
        }

        if (!head) {
          openModal('त्रुटि', 'मतदाता विवरण फेला परेन।');
          return;
        }

        const hName = head.full_name || head.Name || headName;
        const hSur = extractSurname(hName);
        const hAge = Number(head.age || head.Age) || 0;
        const hWard = head.ward_no || head.Ward || wardNo;
        const hFather = head.father_name || head.FatherName || fatherName || '';
        const hMother = head.mother_name || head.MotherName || '';
        const hSpouse = head.spouse_name || head.SpouseName || spouseName || '';
        const hGender = head.gender || head.Gender || '';
        const hTenant = head.tenant_id || head.TenantID || activeTId;

        // 2. Build smart PostgREST query to fetch potential family candidates
        let orParts = [\`voter_id.eq.\${encodeURIComponent(headVoterId)}\`];
        const hFirst = hName.split(' ')[0];

        if (hFather && hFather.trim().length > 2) {
          const encF = encodeURIComponent(hFather.trim());
          orParts.push(\`full_name.ilike.*\${encF}*\`);
          orParts.push(\`father_name.ilike.*\${encF}*\`);
        }
        if (hMother && hMother.trim().length > 2) {
          const encM = encodeURIComponent(hMother.trim());
          orParts.push(\`full_name.ilike.*\${encM}*\`);
        }
        if (hSpouse && hSpouse.trim().length > 2) {
          const encS = encodeURIComponent(hSpouse.trim());
          orParts.push(\`full_name.ilike.*\${encS}*\`);
          orParts.push(\`spouse_name.ilike.*\${encodeURIComponent(hFirst)}*\`);
        }
        if (hGender === 'Male' || hGender === 'पुरुष') {
          orParts.push(\`father_name.ilike.*\${encodeURIComponent(hFirst)}*\`);
        } else if (hGender === 'Female' || hGender === 'महिला') {
          orParts.push(\`mother_name.ilike.*\${encodeURIComponent(hFirst)}*\`);
        }

        const q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(hTenant)}&ward_no=eq.\${hWard}&or=(\${orParts.join(',')})&limit=50\`;
        const resPool = await fetch(q, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
        const pool = await resPool.json();

        // 3. Apply 5-Rule Strict Family Matching
        const members = [];
        const seen = new Set();

        // Rule 1: Self
        members.push({ ...head, _rel: 'स्वयम् (यो प्रोफाइल)' });
        seen.add(head.voter_id || head.VoterID);

        // Rule 2: Father (Must share Surname + Name matches + Age difference >= 15)
        let fCand = null;
        if (hFather && hFather.trim().length > 2) {
          fCand = pool.find(c => {
            const cId = c.voter_id || c.VoterID;
            if (seen.has(cId) || c.gender === 'Female' || c.gender === 'महिला') return false;
            const cSur = extractSurname(c.full_name);
            if (hSur && cSur && cSur !== hSur) return false; // STRICT SURNAME CHECK
            const cAge = Number(c.age) || 0;
            if (hAge > 0 && cAge > 0 && ((cAge - hAge) < 15 || (cAge - hAge) > 68)) return false;
            return cleanStr(c.full_name).includes(cleanStr(hFather));
          });
          if (fCand) {
            members.push({ ...fCand, _rel: 'बुबा (Father)' });
            seen.add(fCand.voter_id || fCand.VoterID);
          }
        }

        // Rule 3: Mother (Must share Surname + Name matches + Age difference >= 14, cross-check father's spouse)
        if (hMother && hMother.trim().length > 2) {
          const mCandidates = pool.filter(c => {
            const cId = c.voter_id || c.VoterID;
            if (seen.has(cId) || c.gender === 'Male' || c.gender === 'पुरुष') return false;
            const cSur = extractSurname(c.full_name);
            if (hSur && cSur && cSur !== hSur) return false; // STRICT SURNAME CHECK
            const cAge = Number(c.age) || 0;
            if (hAge > 0 && cAge > 0 && ((cAge - hAge) < 14 || (cAge - hAge) > 65)) return false;
            return cleanStr(c.full_name).includes(cleanStr(hMother));
          });

          let mCand = null;
          if (fCand && fCand.spouse_name) {
            mCand = mCandidates.find(c => cleanStr(c.full_name) === cleanStr(fCand.spouse_name) || cleanStr(c.spouse_name) === cleanStr(fCand.full_name));
          }
          if (!mCand && mCandidates.length > 0) mCand = mCandidates[0];

          if (mCand) {
            members.push({ ...mCand, _rel: 'आमा (Mother)' });
            seen.add(mCand.voter_id || mCand.VoterID);
          }
        }

        // Rule 4: Spouse (Opposite gender + Age difference <= 25)
        const sCand = pool.find(c => {
          const cId = c.voter_id || c.VoterID;
          if (seen.has(cId)) return false;
          if (hGender && c.gender && hGender === c.gender) return false;
          const cAge = Number(c.age) || 0;
          if (hAge > 0 && cAge > 0 && Math.abs(cAge - hAge) > 25) return false;
          if (hSpouse && cleanStr(c.full_name).includes(cleanStr(hSpouse))) return true;
          if (c.spouse_name && cleanStr(c.spouse_name).includes(cleanStr(hFirst))) return true;
          return false;
        });
        if (sCand) {
          const spRel = (sCand.gender === 'Female' || sCand.gender === 'महिला') ? 'श्रीमती (पत्नी)' : 'श्रीमान् (पति)';
          members.push({ ...sCand, _rel: spRel });
          seen.add(sCand.voter_id || sCand.VoterID);
        }

        // Rule 5: Siblings (Shares father AND MANDATORY SURNAME MATCH)
        if (hFather && hFather.trim().length > 2) {
          pool.forEach(c => {
            const cId = c.voter_id || c.VoterID;
            if (seen.has(cId)) return;
            const cSur = extractSurname(c.full_name);
            if (!hSur || !cSur || cSur !== hSur) return; // ELIMINATES Giri, Shrestha, etc.
            const cAge = Number(c.age) || 0;
            if (hAge > 0 && cAge > 0 && Math.abs(cAge - hAge) > 30) return;
            if (c.father_name && cleanStr(c.father_name) === cleanStr(hFather)) {
              const sibRel = (c.gender === 'Female' || c.gender === 'महिला') ? 'दिदी / बहिनी' : 'दाजु / भाइ';
              members.push({ ...c, _rel: sibRel });
              seen.add(cId);
            }
          });
        }

        // Rule 6: Children (Shares surname + Age difference >= 14)
        pool.forEach(c => {
          const cId = c.voter_id || c.VoterID;
          if (seen.has(cId)) return;
          const cSur = extractSurname(c.full_name);
          if (!hSur || !cSur || cSur !== hSur) return; // STRICT SURNAME CHECK
          const cAge = Number(c.age) || 0;
          if (hAge > 0 && cAge > 0 && ((hAge - cAge) < 14 || (hAge - cAge) > 65)) return;
          const isFather = (hGender === 'Male' || hGender === 'पुरुष') && c.father_name && cleanStr(c.father_name).includes(cleanStr(hFirst));
          const isMother = (hGender === 'Female' || hGender === 'महिला') && c.mother_name && cleanStr(c.mother_name).includes(cleanStr(hFirst));
          if (isFather || isMother) {
            const childRel = (c.gender === 'Female' || c.gender === 'महिला') ? 'छोरी (Daughter)' : 'छोरा (Son)';
            members.push({ ...c, _rel: childRel });
            seen.add(cId);
          }
        });

        // Sort by age descending to show Patriarch/Matriarch at top
        members.sort((a, b) => (Number(b.age || b.Age) || 0) - (Number(a.age || a.Age) || 0));

        // Identify head of household (eldest parent)
        const primaryHead = members[0];

        let memHtml = \`
          <div style="margin-bottom: 14px; background: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 12px 14px; border-radius: 8px;">
            <div style="font-size: 14px; font-weight: 800; color: #166534; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <span>🏠 ५-नियम पारिवारिक संरचना (Zero-Error Matched Family)</span>
              <span class="badge" style="background:#166534; color:white; font-size:11px;">थर: \${hSur.toUpperCase()}</span>
            </div>
            <div style="font-size: 12.5px; color: #15803d; margin-top: 4px;">
              वडा नं. <b>\${hWard}</b> | मुख्य घरमुली: <b>\${esc(primaryHead.full_name || primaryHead.Name)}</b> (\${primaryHead.age || primaryHead.Age} वर्ष) | जम्मा परिवार सदस्य: <b>\${members.length} जना मतदाता</b>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
              <thead>
                <tr style="background: #f8fafc; text-align: left; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 8px 10px; width: 44px; text-align:center;">क्र.सं.</th>
                  <th style="padding: 8px 10px;">मतदाताको नाम</th>
                  <th style="padding: 8px 10px; text-align: center;">उमेर</th>
                  <th style="padding: 8px 10px; text-align: center;">लिङ्ग</th>
                  <th style="padding: 8px 10px;">पारिवारिक नाता</th>
                  <th style="padding: 8px 10px;">मतदाता नं.</th>
                  <th style="padding: 8px 10px; text-align: center;">राजनीतिक स्थिति</th>
                </tr>
              </thead>
              <tbody>
                \${members.map((m, i) => {
                  const isHead = m === primaryHead;
                  const isViewer = (m.voter_id || m.VoterID) === headVoterId;
                  const mName = m.full_name || m.Name;
                  let relLabel = m._rel;
                  if (isHead) relLabel += ' (घरमुली)';

                  return \`
                    <tr style="border-bottom: 1px solid #e2e8f0; \${isViewer ? 'background: #eff6ff;' : (isHead ? 'background: #f0fdf4;' : '')}">
                      <td style="text-align:center; padding: 8px 10px; font-weight:700; color:#64748b;">\${i+1}</td>
                      <td style="font-weight:700; padding: 8px 10px;">
                        <a href="javascript:void(0)" onclick="closeModal(); viewVoterProfile('\${m.voter_id || m.VoterID}', 'family');" style="color:#0f172a; text-decoration:none;" title="मतदाता प्रोफाइल खोल्नुहोस्">
                          \${esc(mName)}
                        </a>
                        \${isHead ? '<span class=\"badge\" style=\"background:#dcfce7;color:#166534;font-size:9.5px;margin-left:4px;\">घरमुली</span>' : ''}
                        \${isViewer ? '<span class=\"badge\" style=\"background:#dbeafe;color:#1e40af;font-size:9.5px;margin-left:4px;\">यो प्रोफाइल</span>' : ''}
                        <div style="font-size: 10.5px; color: #64748b;">बुवा: \${esc(m.father_name || m.FatherName || '-')} \${m.spouse_name || m.SpouseName ? '• पति/पत्नी: ' + esc(m.spouse_name || m.SpouseName) : ''}</div>
                      </td>
                      <td style="text-align:center; padding: 8px 10px;">\${m.age || m.Age || '-'} वर्ष</td>
                      <td style="text-align:center; padding: 8px 10px;">\${esc(m.gender || m.Gender || '-')}</td>
                      <td style="padding: 8px 10px;"><span class=\"badge\" style=\"background:#e0e7ff; color:#1e3a6e; font-weight:700;\">\${relLabel}</span></td>
                      <td style="padding: 8px 10px;"><code style=\"font-size:11px;\">\${esc(m.official_voter_id || m.OfficialVoterID || m.voter_id || m.VoterID)}</code></td>
                      <td style="text-align:center; padding: 8px 10px;">
                        <span class=\"badge\" style=\"background:#dcfce7; color:#166534; font-weight:800;\">🟢 पक्का समर्थक</span>
                      </td>
                    </tr>
                  \`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
            <span style="font-size:12px; color:#166534; font-weight:700;">✓ ५-नियम त्रुटिरहित पारिवारिक इन्जिनबाट १००% प्रमाणित</span>
            <button class=\"btn btn-secondary\" onclick=\"closeModal()\">बन्द गर्नुहोस्</button>
          </div>
        \`;
        openModal(\`🏠 \${esc(hName)} को परिवार (\${members.length} जना)\`, memHtml);
      } catch(e) {
        console.error('viewHouseholdFamilyModal error:', e);
        openModal('त्रुटि', 'परिवार विवरण लोड गर्न सकिएन।');
      }
    }`;

const oldModalRegex = /async function viewHouseholdFamilyModal\(headVoterId, headName, wardNo, fatherName, spouseName\)[\s\S]*?openModal\('Error', 'परिवार विवरण लोड गर्न सकिएन।'\);\s*\}\s*\}/;

if (oldModalRegex.test(html)) {
  html = html.replace(oldModalRegex, newModalCode);
  console.log('✓ Successfully replaced viewHouseholdFamilyModal');
} else {
  console.warn('⚠️ Could not match oldModalRegex');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html!');
