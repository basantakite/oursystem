import fs from 'fs';

console.log('--- Step 2: Upgrading Gen-Z and Seniors with Live Query Filters & Direct Supabase Write ---');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 1. Upgrade quickToggleGenZSupport, quickUpdateGenZTag, quickUpdateSeniorMobilityTag to use window._currentLivePageVoters & direct Supabase PATCH
const oldGenZActions = `function quickUpdateGenZTag(voterId, newTag) {
      const v = (state.voters || []).find(x => x.VoterID === voterId);
      if (!v) return;
      v.GenZTag = newTag;
      if (newTag === 'peer_leader') v.IsInfluencer = true;
      if (newTag === 'sports_club') {
        if (!Array.isArray(v.CommunityRoles)) v.CommunityRoles = [];
        const hasClub = v.CommunityRoles.some(r => r.category === 'youth_club');
        if (!hasClub) {
          const gName = \`\${v.Tole || ('वडा ' + v.Ward)} युवा क्लब\`;
          v.CommunityRoles.push({
            id: 'ROLE_' + v.VoterID + '_YOUTH',
            groupId: '',
            groupName: gName,
            category: 'youth_club',
            role: 'सदस्य',
            status: 'बहालवाला'
          });
        }
      }
      saveState();
      renderGenZHub();
      const meta = GENZ_TAG_META[newTag] || { label: newTag };
      showToast(\`🔥 \${v.Name} को युवा अभियान ट्याग "\${meta.label}" अपडेट गरियो!\`, 'success');
    }

    function quickToggleGenZSupport(voterId, tierVal) {
      const v = (state.voters || []).find(x => x.VoterID === voterId);
      if (!v) return;
      v.SupportTier = tierVal;
      v.SelfReportedResponse = (tierVal === 'solid' || tierVal === 'lean') ? 'Support' : 'Undecided';
      v.ContactStatus = 'Contacted';
      saveState();
      if (typeof pushVoterToSupabase === 'function') pushVoterToSupabase(v);
      if (typeof renderGenZHub === 'function') renderGenZHub();
      if (typeof renderSeniorsHub === 'function') renderSeniorsHub();
      if (typeof renderCommProfessionDirectory === 'function') renderCommProfessionDirectory();
      if (typeof renderCommunityGroupsView === 'function') renderCommunityGroupsView();
      showToast(\`✅ मतदाता "\${v.Name}" को समर्थन स्थिति (🟢 पक्का) अपडेट भयो!\`, 'success');
    }`;

const newGenZActions = `function getLiveOrStateVoter(voterId) {
      if (!voterId) return null;
      const sId = String(voterId);
      if (window._currentLivePageVoters && window._currentLivePageVoters.has(sId)) {
        return window._currentLivePageVoters.get(sId);
      }
      if (state.voters && state.voters.length) {
        return state.voters.find(x => String(x.VoterID) === sId || String(x.OfficialVoterID) === sId);
      }
      return null;
    }

    function quickUpdateGenZTag(voterId, newTag) {
      const v = getLiveOrStateVoter(voterId);
      if (!v) return;
      v.GenZTag = newTag;
      if (newTag === 'peer_leader') v.IsInfluencer = true;
      if (typeof pushVoterToSupabase === 'function') pushVoterToSupabase(v);
      saveState();
      renderGenZHub();
      const meta = (typeof GENZ_TAG_META !== 'undefined' && GENZ_TAG_META[newTag]) || { label: newTag };
      showToast(\`🔥 \${v.Name} को युवा अभियान ट्याग "\${meta.label}" अपडेट गरियो!\`, 'success');
    }

    function quickToggleGenZSupport(voterId, tierVal) {
      const v = getLiveOrStateVoter(voterId);
      if (!v) return;
      v.SupportTier = tierVal;
      v.SelfReportedResponse = (tierVal === 'solid' || tierVal === 'lean') ? 'Support' : 'Undecided';
      v.ContactStatus = 'Contacted';
      if (typeof pushVoterToSupabase === 'function') pushVoterToSupabase(v);
      saveState();
      if (typeof renderGenZHub === 'function') renderGenZHub();
      if (typeof renderSeniorsHub === 'function') renderSeniorsHub();
      showToast(\`✅ मतदाता "\${v.Name}" को समर्थन स्थिति (🟢 पक्का) सुपाबेसमा सुरक्षित भयो!\`, 'success');
    }`;

if (html.includes(oldGenZActions)) {
  html = html.replace(oldGenZActions, newGenZActions);
  console.log('✓ Upgraded quickUpdateGenZTag & quickToggleGenZSupport to resolve live voters & patch cloud directly');
}

// 2. Upgrade quickUpdateSeniorMobilityTag to use getLiveOrStateVoter
const oldSeniorAction = `function quickUpdateSeniorMobilityTag(voterId, newTag) {
      const v = (state.voters || []).find(x => x.VoterID === voterId);
      if (!v) return;
      v.SeniorMobilityTag = newTag;
      saveState();
      renderSeniorsHub();
      const meta = SENIORS_TAG_META[newTag] || { label: newTag };
      showToast(\`👵 \${v.Name} को ज्येष्ठ नागरिक सेवा ट्याग "\${meta.label}" अपडेट गरियो!\`, 'success');
    }`;

const newSeniorAction = `function quickUpdateSeniorMobilityTag(voterId, newTag) {
      const v = (typeof getLiveOrStateVoter === 'function') ? getLiveOrStateVoter(voterId) : (state.voters || []).find(x => x.VoterID === voterId);
      if (!v) return;
      v.SeniorMobilityTag = newTag;
      if (typeof pushVoterToSupabase === 'function') pushVoterToSupabase(v);
      saveState();
      renderSeniorsHub();
      const meta = (typeof SENIORS_TAG_META !== 'undefined' && SENIORS_TAG_META[newTag]) || { label: newTag };
      showToast(\`👵 \${v.Name} को ज्येष्ठ नागरिक सेवा ट्याग "\${meta.label}" सुपाबेसमा सुरक्षित भयो!\`, 'success');
    }`;

if (html.includes(oldSeniorAction)) {
  html = html.replace(oldSeniorAction, newSeniorAction);
  console.log('✓ Upgraded quickUpdateSeniorMobilityTag to resolve live voters & patch cloud directly');
}

// 3. Connect Gen-Z sub-filters (support, location) to loadLiveGenZVotersList
const oldGenZQueryAnchor = `const wardVal = (document.getElementById('genZWardFilter')?.value || '').trim();

      const pageSize = 50;
      const page = genZCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}&age=gte.18&age=lte.25\`;
      if (wardVal && wardVal !== 'All' && wardVal !== 'सबै' && wardVal !== 'सबै वडा' && wardVal !== '') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }
      if (searchVal) {
        const enc = encodeURIComponent(searchVal);
        q += \`&or=(full_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*,father_name.ilike.*\${enc}*)\`;
      }`;

const newGenZQueryAnchor = `const wardVal = (document.getElementById('genZWardFilter')?.value || '').trim();
      const supportVal = (document.getElementById('genZSupportFilter')?.value || '').trim();
      const locationVal = (document.getElementById('genZLocationFilter')?.value || '').trim();

      const pageSize = 50;
      const page = genZCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}&age=gte.18&age=lte.25\`;
      if (wardVal && wardVal !== 'All' && wardVal !== 'सबै' && wardVal !== 'सबै वडा' && wardVal !== '') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }
      if (supportVal === 'solid') {
        q += '&sentiment=eq.solid';
      } else if (supportVal === 'swing') {
        q += '&sentiment=eq.swing';
      }
      if (searchVal) {
        const enc = encodeURIComponent(searchVal);
        q += \`&or=(full_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*,father_name.ilike.*\${enc}*)\`;
      }`;

if (html.includes(oldGenZQueryAnchor)) {
  html = html.replace(oldGenZQueryAnchor, newGenZQueryAnchor);
  console.log('✓ Connected Gen-Z support filters to live query');
}

// 4. Connect Seniors sub-filters (support) to loadLiveSeniorsVotersList
const oldSeniorQueryAnchor = `const wardVal = (document.getElementById('seniorsWardFilter')?.value || '').trim();

      const pageSize = 50;
      const page = seniorsCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}&age=gte.60\`;
      if (wardVal && wardVal !== 'All' && wardVal !== 'सबै' && wardVal !== 'सबै वडा' && wardVal !== '') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }
      if (searchVal) {
        const enc = encodeURIComponent(searchVal);
        q += \`&or=(full_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*,father_name.ilike.*\${enc}*)\`;
      }`;

const newSeniorQueryAnchor = `const wardVal = (document.getElementById('seniorsWardFilter')?.value || '').trim();
      const supportVal = (document.getElementById('seniorsSupportFilter')?.value || '').trim();

      const pageSize = 50;
      const page = seniorsCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}&age=gte.60\`;
      if (wardVal && wardVal !== 'All' && wardVal !== 'सबै' && wardVal !== 'सबै वडा' && wardVal !== '') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }
      if (supportVal === 'solid') {
        q += '&sentiment=eq.solid';
      } else if (supportVal === 'swing') {
        q += '&sentiment=eq.swing';
      }
      if (searchVal) {
        const enc = encodeURIComponent(searchVal);
        q += \`&or=(full_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*,father_name.ilike.*\${enc}*)\`;
      }`;

if (html.includes(oldSeniorQueryAnchor)) {
  html = html.replace(oldSeniorQueryAnchor, newSeniorQueryAnchor);
  console.log('✓ Connected Seniors support filters to live query');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html for Step 2!');
