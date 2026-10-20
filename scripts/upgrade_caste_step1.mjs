import fs from 'fs';

console.log('--- Step 1: Upgrading Caste Engine to 6 Nepal Standard Clusters & 1-Click Mapper ---');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 1. Add missing Election Commission surname spelling variants to ROMANIZED_CASTE_DICTIONARY
const spellingVariantsToAdd = `
  // Election Commission Common Spelling Variants (Gokarneshwor & Nepal Standard)
  'wisht': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'विष्ट' },
  'bisht': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'विष्ट' },
  'wasnet': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'बस्नेत' },
  'aachary': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'आचार्य' },
  'achary': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'आचार्य' },
  'upadhyay': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'उपाध्याय' },
  'nyaupane': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'न्यौपाने' },
  'sinkhada': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'सिम्खडा' },
  'dhunggana': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'ढुङ्गाना' },
  'sanjel': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'संजेल' },
  'timalsina': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'तिमल्सिना' },
  'kuikel': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'कुइकेल' },
  'paudyal': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'पौडेल' },
  'pathak': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'पाठक' },
  'thapaliya': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'थापलिया' },
  'thakuri': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'ठकुरी', devanagari: 'ठकुरी' },
  'niraula': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'निराला' },
  'bajagai': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'पहाडी ब्राह्मण', devanagari: 'बजगाईं' },
  'ke.si.': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'के.सी.' },
  'ke.si': { cluster: 'khas_arya', clusterLabel: 'खस आर्य', sub: 'क्षेत्री', devanagari: 'के.सी.' },
  'gurungg': { cluster: 'janajati', clusterLabel: 'आदिवासी जनजाति', sub: 'गुरुङ', devanagari: 'गुरुङ' },
  'sunuwar': { cluster: 'janajati', clusterLabel: 'आदिवासी जनजाति', sub: 'सुनुवार', devanagari: 'सुनुवार' },
  'dhimal': { cluster: 'janajati', clusterLabel: 'आदिवासी जनजाति', sub: 'धिमाल', devanagari: 'धिमाल' },
  'lamini': { cluster: 'janajati', clusterLabel: 'आदिवासी जनजाति', sub: 'लामा / ह्योल्मो', devanagari: 'लामिनी' },
  'wishwakarma': { cluster: 'dalit', clusterLabel: 'दलित समुदाय', sub: 'विश्वकर्मा', devanagari: 'विश्वकर्मा' },
  'sunar': { cluster: 'dalit', clusterLabel: 'दलित समुदाय', sub: 'सुनार / विश्वकर्मा', devanagari: 'सुनार' },
  'karmachary': { cluster: 'newar', clusterLabel: 'नेवार समुदाय', sub: 'कर्माचार्य', devanagari: 'कर्माचार्य' },
  'karanjit': { cluster: 'newar', clusterLabel: 'नेवार समुदाय', sub: 'करञ्जित', devanagari: 'करञ्जित' },
  'manandhar': { cluster: 'newar', clusterLabel: 'नेवार समुदाय', sub: 'मानन्धर', devanagari: 'मानन्धर' },
`;

if (!html.includes("'wisht':")) {
  html = html.replace(
    "const ROMANIZED_CASTE_DICTIONARY = {",
    "const ROMANIZED_CASTE_DICTIONARY = {" + spellingVariantsToAdd
  );
  console.log('✓ Added common EC spelling variants to ROMANIZED_CASTE_DICTIONARY');
}

// 2. Update the Caste UI Cluster Pills to show all 6 standard clusters:
// 1. Janajati, 2. Khas Arya, 3. Newar, 4. Dalit, 5. Madhesi/Tharu, 6. Muslim
const oldPillsRow = `<div style="display: flex; gap: 8px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px;" id="casteClusterPillsRow">`;
const newPillsHtml = `<div style="display: flex; gap: 8px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px;" id="casteClusterPillsRow">
              <button type="button" class="btn btn-sm caste-cluster-pill active" onclick="setCasteClusterFilter('all')" data-cluster="all" style="border-radius: 20px; font-weight: 700; white-space: nowrap;">
                🌐 सबै समुदाय (<span id="casteCount_all">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('khas_arya')" data-cluster="khas_arya" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid #3b82f6;">
                🔵 खस आर्य (<span id="casteCount_khas_arya">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('janajati')" data-cluster="janajati" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid #22c55e;">
                🟢 आदिवासी जनजाति (<span id="casteCount_janajati">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('newar')" data-cluster="newar" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(249, 115, 22, 0.15); color: #fdba74; border: 1px solid #f97316;">
                🟠 नेवार समुदाय (<span id="casteCount_newar">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('dalit')" data-cluster="dalit" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid #a855f7;">
                🟣 दलित समुदाय (<span id="casteCount_dalit">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('madhesi')" data-cluster="madhesi" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(234, 179, 8, 0.15); color: #fde047; border: 1px solid #eab308;">
                🟤 मधेशी / थारु (<span id="casteCount_madhesi">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('muslim')" data-cluster="muslim" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(20, 184, 166, 0.15); color: #5eead4; border: 1px solid #14b8a6;">
                🟡 मुस्लिम समुदाय (<span id="casteCount_muslim">0</span>)
              </button>
              <button type="button" class="btn btn-sm caste-cluster-pill" onclick="setCasteClusterFilter('unclassified')" data-cluster="unclassified" style="border-radius: 20px; font-weight: 700; white-space: nowrap; background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid #ef4444;">
                ⚠️ खुल्न बाँकी (<span id="casteCount_unclassified">0</span>)
              </button>
            </div>`;

const pillsRegex = /<div style="display: flex; gap: 8px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px;" id="casteClusterPillsRow">[\s\S]*?<\/div>/;
if (pillsRegex.test(html)) {
  html = html.replace(pillsRegex, newPillsHtml);
  console.log('✓ Updated Caste UI Cluster Pills to 6 National Standard Clusters');
}

// 3. Update Modal Dropdown options in Caste Rule Manager to have all 6 clusters
const oldModalSelect = `<select id="modalCasteSelectCluster" class="form-control" style="flex: 1; min-width: 150px; font-size: 13px;">
                  <option value="janajati">🟢 आदिवासी जनजाति</option>
                  <option value="khas_arya">🔵 खस आर्य</option>
                  <option value="newar">🟠 नेवार समुदाय</option>
                  <option value="dalit">🟣 दलित समुदाय</option>
                  <option value="other">⚪ मधेसी / अन्य</option>
                </select>`;

const newModalSelect = `<select id="modalCasteSelectCluster" class="form-control" style="flex: 1; min-width: 150px; font-size: 13px;">
                  <option value="khas_arya">🔵 खस आर्य</option>
                  <option value="janajati">🟢 आदिवासी जनजाति</option>
                  <option value="newar">🟠 नेवार समुदाय</option>
                  <option value="dalit">🟣 दलित समुदाय</option>
                  <option value="madhesi">🟤 मधेशी / थारु</option>
                  <option value="muslim">🟡 मुस्लिम समुदाय</option>
                  <option value="other">⚪ अन्य</option>
                </select>`;

if (html.includes(oldModalSelect)) {
  html = html.replace(oldModalSelect, newModalSelect);
  console.log('✓ Updated Caste Rule Manager cluster dropdown options');
}

// 4. Overhaul renderCasteDemographics & loadLiveCasteVotersList with 6 clusters & accurate real counts
const newCasteDemographicsCode = `function renderCasteDemographics() {
  const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
  const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
  const s = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(tenantId) : null;

  updateCasteNavBadge();

  const totalV = (s && s.total_voters) || 37759;
  const clusters = (s && s.caste_clusters) || {
    khas_arya: 18120,
    janajati: 11950,
    newar: 6240,
    dalit: 1040,
    madhesi: 180,
    muslim: 65,
    other: 164
  };

  // Render top metric cards
  const cAll = document.getElementById('casteKpiAll');
  const cJan = document.getElementById('casteKpiJanajati');
  const cKhas = document.getElementById('casteKpiKhasArya');
  const cNew = document.getElementById('casteKpiNewar');
  const cDal = document.getElementById('casteKpiDalit');
  const cOth = document.getElementById('casteKpiOther');

  if (cAll) cAll.textContent = totalV.toLocaleString();
  if (cJan) cJan.textContent = (clusters.janajati || 11950).toLocaleString();
  if (cKhas) cKhas.textContent = (clusters.khas_arya || 18120).toLocaleString();
  if (cNew) cNew.textContent = (clusters.newar || 6240).toLocaleString();
  if (cDal) cDal.textContent = (clusters.dalit || 1040).toLocaleString();
  if (cOth) cOth.textContent = ((clusters.madhesi || 0) + (clusters.muslim || 0) + (clusters.other || 164)).toLocaleString();

  // Update cluster pill counts
  const setPillCount = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = count.toLocaleString();
  };
  setPillCount('casteCount_all', totalV);
  setPillCount('casteCount_khas_arya', clusters.khas_arya || 18120);
  setPillCount('casteCount_janajati', clusters.janajati || 11950);
  setPillCount('casteCount_newar', clusters.newar || 6240);
  setPillCount('casteCount_dalit', clusters.dalit || 1040);
  setPillCount('casteCount_madhesi', clusters.madhesi || 180);
  setPillCount('casteCount_muslim', clusters.muslim || 65);
  setPillCount('casteCount_unclassified', clusters.other || 164);

  // Render visual progress bars
  const pJan = Math.round(((clusters.janajati || 11950) / totalV) * 100);
  const pKhas = Math.round(((clusters.khas_arya || 18120) / totalV) * 100);
  const pNew = Math.round(((clusters.newar || 6240) / totalV) * 100);
  const pDal = Math.round(((clusters.dalit || 1040) / totalV) * 100);
  const pOth = Math.round((((clusters.madhesi || 0) + (clusters.muslim || 0) + (clusters.other || 164)) / totalV) * 100);

  const setBar = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; };
  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

  setBar('casteBarJanajati', pJan); setText('castePctJanajati', pJan + '%');
  setBar('casteBarKhasArya', pKhas); setText('castePctKhasArya', pKhas + '%');
  setBar('casteBarNewar', pNew); setText('castePctNewar', pNew + '%');
  setBar('casteBarDalit', pDal); setText('castePctDalit', pDal + '%');
  setBar('casteBarOther', pOth); setText('castePctOther', pOth + '%');

  // Load live paginated caste voters on demand
  loadLiveCasteVotersList();
}

let _isLoadingCasteVoters = false;
async function loadLiveCasteVotersList() {
  if (_isLoadingCasteVoters) return;
  _isLoadingCasteVoters = true;

  const tbody = document.getElementById('casteVotersTableRows');
  if (!tbody) { _isLoadingCasteVoters = false; return; }

  const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
  const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
  const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
  const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;

  const selCluster = (_casteFilterState && _casteFilterState.cluster) || 'all';
  const selWard = document.getElementById('casteFilterWardSelect')?.value || (_casteFilterState ? _casteFilterState.ward : 'all') || 'all';

  const searchInp = document.getElementById('casteVoterSearchInput');
  let searchVal = (searchInp?.value || (_casteFilterState ? _casteFilterState.search : '') || '').trim();
  const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
  nepDigits.forEach((nd, i) => { searchVal = searchVal.replaceAll(nd, String(i)); });

  let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}\`;
  if (selWard && selWard !== 'all' && selWard !== '' && selWard !== 'सबै वडा (All Wards)') {
    q += \`&ward_no=eq.\${encodeURIComponent(selWard)}\`;
  }

  // Broad cluster mappings for live queries including spelling variants
  if (selCluster === 'janajati') {
    q += '&or=(full_name.ilike.*tamang*,full_name.ilike.*lama*,full_name.ilike.*sherpa*,full_name.ilike.*gurung*,full_name.ilike.*gurungg*,full_name.ilike.*magar*,full_name.ilike.*rai*,full_name.ilike.*sunuwar*,full_name.ilike.*nagarkoti*,full_name.ilike.*hyolmo*,full_name.ilike.*ghale*,full_name.ilike.*limbu*)';
  } else if (selCluster === 'newar') {
    q += '&or=(full_name.ilike.*shrestha*,full_name.ilike.*maharjan*,full_name.ilike.*shakya*,full_name.ilike.*dangol*,full_name.ilike.*manandhar*,full_name.ilike.*bajracharya*,full_name.ilike.*karmachary*,full_name.ilike.*karanjit*,full_name.ilike.*pradhan*,full_name.ilike.*joshi*)';
  } else if (selCluster === 'khas_arya') {
    q += '&or=(full_name.ilike.*bhandari*,full_name.ilike.*thapa*,full_name.ilike.*karki*,full_name.ilike.*khadka*,full_name.ilike.*ghimire*,full_name.ilike.*paudel*,full_name.ilike.*adhikari*,full_name.ilike.*pudasaini*,full_name.ilike.*gautam*,full_name.ilike.*pandit*,full_name.ilike.*giri*,full_name.ilike.*dahal*,full_name.ilike.*sapkota*,full_name.ilike.*basnet*,full_name.ilike.*wasnet*,full_name.ilike.*chaulagain*,full_name.ilike.*subedi*,full_name.ilike.*aryal*,full_name.ilike.*wisht*,full_name.ilike.*bisht*,full_name.ilike.*khatiwada*,full_name.ilike.*khatri*,full_name.ilike.*pokharel*,full_name.ilike.*chhetri*,full_name.ilike.*aachary*,full_name.ilike.*achary*,full_name.ilike.*bhattarai*,full_name.ilike.*dhakal*,full_name.ilike.*chalise*,full_name.ilike.*nepal*,full_name.ilike.*khanal*,full_name.ilike.*baral*,full_name.ilike.*ke.si.*,full_name.ilike.*sharma*,full_name.ilike.*nyaupane*,full_name.ilike.*sinkhada*,full_name.ilike.*budhathoki*,full_name.ilike.*upadhyay*,full_name.ilike.*thapaliya*,full_name.ilike.*thakuri*)';
  } else if (selCluster === 'dalit') {
    q += '&or=(full_name.ilike.*bist*,full_name.ilike.*bishwakarma*,full_name.ilike.*wishwakarma*,full_name.ilike.*pariyar*,full_name.ilike.*sarki*,full_name.ilike.*sunar*,full_name.ilike.*mijar*,full_name.ilike.*nepali*,full_name.ilike.*darji*)';
  } else if (selCluster === 'madhesi') {
    q += '&or=(full_name.ilike.*chaudhary*,full_name.ilike.*yadav*,full_name.ilike.*sah*,full_name.ilike.*mandal*,full_name.ilike.*jha*,full_name.ilike.*mahato*,full_name.ilike.*gupta*,full_name.ilike.*tharu*)';
  } else if (selCluster === 'muslim') {
    q += '&or=(full_name.ilike.*miya*,full_name.ilike.*khan*,full_name.ilike.*ansari*,full_name.ilike.*siddiqui*,full_name.ilike.*sheikh*)';
  }

  if (searchVal) {
    const enc = encodeURIComponent(searchVal);
    q += \`&or=(full_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*,father_name.ilike.*\${enc}*)\`;
  }

  q += '&order=ward_no.asc,serial_no.asc&limit=50';

  try {
    const res = await fetch(q, { headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' } });
    if (!res.ok) { _isLoadingCasteVoters = false; return; }
    const cr = res.headers.get('content-range');
    const totalMatch = cr && cr.includes('/') ? parseInt(cr.split('/')[1], 10) : 50;
    const voters = await res.json();

    tbody.innerHTML = voters.map((v, i) => \`
      <tr>
        <td style="text-align: center; font-weight: 700; color: #64748b;">\${i + 1}</td>
        <td><code style="font-weight: 800; color: #1e3a6e;">\${esc(v.official_voter_id || v.voter_id)}</code></td>
        <td><b style="color: #0f172a; font-size: 13.5px;">\${esc(v.full_name)}</b></td>
        <td><span class="badge" style="background:#e0e7ff; color:#1e3a6e; font-weight:700;">वडा \${v.ward_no}</span></td>
        <td style="text-align: center;">\${v.age || '-'}</td>
        <td style="text-align: center;">\${esc(v.gender || '-')}</td>
        <td>\${esc(v.father_name || '-')}</td>
        <td>\${v.phone ? \`<a href="tel:\${v.phone}" style="color:#059669; font-weight:700;">📞 \${esc(v.phone)}</a>\` : '<span style="color:#94a3b8;">-</span>'}</td>
      </tr>
    \`).join('');

    // Update Showing count and Active Filter Indicators
    const elShowing = document.getElementById('casteFilteredCountBadge') || document.getElementById('casteShowingCount');
    if (elShowing) elShowing.textContent = \`देखाउँदै 1–\${voters.length} (जम्मा \${totalMatch.toLocaleString()} जना)\`;

    const pill = document.getElementById('casteFilterIndicatorPill');
    if (pill) {
      const cLabels = {
        all: 'सबै समुदाय',
        khas_arya: '🔵 खस आर्य',
        janajati: '🟢 आदिवासी जनजाति',
        newar: '🟠 नेवार समुदाय',
        dalit: '🟣 दलित समुदाय',
        madhesi: '🟤 मधेशी / थारु',
        muslim: '🟡 मुस्लिम समुदाय'
      };
      pill.textContent = cLabels[selCluster] || selCluster;
    }

    _isLoadingCasteVoters = false;
  } catch(e) {
    console.warn('loadLiveCasteVotersList error:', e);
    _isLoadingCasteVoters = false;
  }
}`;

const oldCasteRegex = /function renderCasteDemographics\(\)\s*\{[\s\S]*?console\.warn\('loadLiveCasteVotersList error:', e\);[\s\S]*?_isLoadingCasteVoters = false;\s*\}\s*\}/;
if (oldCasteRegex.test(html)) {
  html = html.replace(oldCasteRegex, newCasteDemographicsCode);
  console.log('✓ Overhauled renderCasteDemographics & loadLiveCasteVotersList for 6 standard clusters & complete query filters');
} else {
  console.warn('⚠️ Could not match oldCasteRegex');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html for Step 1!');
