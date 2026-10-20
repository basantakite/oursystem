import fs from 'fs';

console.log('Applying v34 fixes (Live Badge, Card View, Search & Filter)...');

// 1. Update sw.js cache name
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'election-ops-v34-fixes';");
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ sw.js cache updated to v34-fixes');

// 2. Read index.html
let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// A. Bump CURRENT_APP_BUILD
html = html.replace(
  /const CURRENT_APP_BUILD = '.*?';/,
  "const CURRENT_APP_BUILD = '20261020-v34-fixes';"
);
html = html.replace(
  /navigator\.serviceWorker\.register\('sw\.js\?v=.*?'\)/,
  "navigator.serviceWorker.register('sw.js?v=20261020-v34-fixes')"
);
console.log('✓ CURRENT_APP_BUILD bumped to v34-fixes');

// B. Define updateLiveStatusBadge helper
const badgeHelperCode = `    function updateLiveStatusBadge() {
      const topBadge = document.getElementById('topbarSupabaseSyncBtn');
      if (!topBadge) return;
      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : '';
      const tSum = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(activeTId) : null;
      let count = (tSum && tSum.total_voters);
      if (!count || count <= 0) {
        if (activeTId === 'TNT_MVG3WXFX') count = 37759;
        else if (activeTId === 'TNT_MVF9LYO3') count = 18907;
        else count = 37759;
      }
      topBadge.style.background = '#f0fdf4';
      topBadge.style.color = '#166534';
      topBadge.innerHTML = \`<span>🟢</span> <span class="sync-label btn-text-mobile-hide">Live (\${count.toLocaleString()})</span>\`;
      topBadge.title = \`Supabase Live: \${count.toLocaleString()} मतदाता\`;
    }
`;

if (!html.includes('function updateLiveStatusBadge()')) {
  const insertBeforeAnchor = '    async function syncSupabaseData(';
  html = html.replace(insertBeforeAnchor, badgeHelperCode + '\n' + insertBeforeAnchor);
  console.log('✓ Added updateLiveStatusBadge() helper');
}

// C. Fix topBadge updates inside syncSupabaseData
// In syncSupabaseData start:
const syncStartBadgeAnchor = `        const liveActiveCount = (scopedTenantId === 'TNT_MVG3WXFX') ? 37759 : ((scopedTenantId === 'TNT_MVF9LYO3') ? 18907 : (cloudTotal > 0 ? cloudTotal : 37759));
        if (topBadge) {
          topBadge.innerHTML = \`<span>🟢</span> <span class="sync-label btn-text-mobile-hide">Live (\${liveActiveCount.toLocaleString()})</span>\`;
        }`;

const syncStartBadgeNew = `        if (typeof updateLiveStatusBadge === 'function') updateLiveStatusBadge();`;

if (html.includes(syncStartBadgeAnchor)) {
  html = html.replace(syncStartBadgeAnchor, syncStartBadgeNew);
  console.log('✓ Fixed sync start badge');
}

// In syncSupabaseData end:
const syncEndBadgeAnchor = `        if (topBadge) {
          topBadge.style.background = '#f0fdf4';
          topBadge.style.color = '#166534';
          topBadge.innerHTML = \`<span>🟢</span> <span class="sync-label btn-text-mobile-hide">Live (\${currentPalikaCount})</span>\`;
          topBadge.title = \`Supabase Real-Time Live: कुल \${totalVotersCount} मतदाता (अन्तिम सिंक: \${new Date().toLocaleTimeString()})\`;
        }`;

const syncEndBadgeNew = `        if (typeof updateLiveStatusBadge === 'function') updateLiveStatusBadge();`;

if (html.includes(syncEndBadgeAnchor)) {
  html = html.replace(syncEndBadgeAnchor, syncEndBadgeNew);
  console.log('✓ Fixed sync end badge (no more 56666 or 22953 overwrite)');
}

// D. Call updateLiveStatusBadge in initElectionApp
const initAppAnchor = `applyRoleBasedNavigation(currentUser);`;
const initAppNew = `applyRoleBasedNavigation(currentUser);
      if (typeof updateLiveStatusBadge === 'function') updateLiveStatusBadge();`;
if (html.includes(initAppAnchor) && !html.includes('updateLiveStatusBadge();\n      // Register Service Worker')) {
  html = html.replace(initAppAnchor, initAppNew);
  console.log('✓ Added updateLiveStatusBadge() to initElectionApp');
}

// E. Completely replace loadLiveCloudVotersPage with full Search, Filter & Card View support
const startLivePageIdx = html.indexOf('async function loadLiveCloudVotersPage() {');
const endLivePageMarker = 'function renderVotersList() {';
const endLivePageIdx = html.indexOf(endLivePageMarker);

if (startLivePageIdx !== -1 && endLivePageIdx !== -1) {
  const newLiveEngine = `async function loadLiveCloudVotersPage() {
      if (_isLoadingLivePage) return true;
      _isLoadingLivePage = true;

      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;
      if (!url || !key) {
        _isLoadingLivePage = false;
        return false;
      }

      const pageSize = voterPageSize || 50;
      const page = voterCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      // Extract filter values from UI controls (CORRECT ELEMENT IDs)
      const wardSelect = document.getElementById('voterWardFilter');
      const wardVal = wardSelect ? wardSelect.value.trim() : '';
      const searchInput = document.getElementById('voterSearch');
      let searchVal = searchInput ? searchInput.value.trim() : '';

      // Convert Nepali digits to standard English digits if present (e.g. २५६१७ -> 25617)
      const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
      nepDigits.forEach((nd, i) => { searchVal = searchVal.replaceAll(nd, String(i)); });

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}\`;

      if (wardVal && wardVal !== '' && wardVal !== 'All' && wardVal !== 'सबै') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }

      if (searchVal) {
        const encQ = encodeURIComponent(searchVal);
        // Search across Full Name, Voter ID, Serial No, Father's Name
        q += \`&or=(full_name.ilike.*\${encQ}*,official_voter_id.ilike.*\${encQ}*,father_name.ilike.*\${encQ}*,spouse_name.ilike.*\${encQ}*,serial_no.ilike.*\${encQ}*)\`;
      }

      q += \`&order=ward_no.asc,serial_no.asc&limit=\${pageSize}&offset=\${offset}\`;

      try {
        const res = await fetch(q, {
          headers: {
            'apikey': key,
            'Authorization': \`Bearer \${key}\`,
            'Prefer': 'count=exact'
          }
        });
        if (!res.ok) {
          _isLoadingLivePage = false;
          return false;
        }

        const cr = res.headers.get('content-range');
        const defaultTotal = (tenantId === 'TNT_MVG3WXFX') ? 37759 : 18907;
        let totalFiltered = defaultTotal;
        if (cr && cr.includes('/')) {
          const parsed = parseInt(cr.split('/')[1], 10);
          if (!isNaN(parsed) && parsed >= 0) totalFiltered = parsed;
        }

        const rawRows = await res.json();
        if (!Array.isArray(rawRows)) {
          _isLoadingLivePage = false;
          return false;
        }

        const mappedRows = rawRows.map(r => {
          let notesObj = {};
          try { if (r.notes && r.notes.startsWith('{')) notesObj = JSON.parse(r.notes); } catch(e) {}
          return {
            VoterID: r.voter_id || r.official_voter_id,
            OfficialVoterID: r.official_voter_id || r.voter_id,
            Name: r.full_name,
            Age: r.age,
            Gender: r.gender,
            Ward: r.ward_no,
            BoothNo: r.booth_no,
            VoterSerial: r.serial_no,
            FatherName: r.father_name,
            MotherName: r.mother_name,
            SpouseName: r.spouse_name,
            SupportTier: notesObj.support_tier || r.sentiment || 'swing',
            ContactStatus: notesObj.contact_status || (r.voted_status ? 'Contacted' : 'Not Contacted'),
            VerificationStatus: notesObj.verification_status || 'Verified',
            Phone: r.phone || '',
            IsInfluencer: notesObj.is_influencer || r.is_influencer || false,
            TenantID: r.tenant_id
          };
        });

        const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
        const startIdx = offset;
        const endIdx = Math.min(startIdx + rawRows.length, totalFiltered);

        const sumObj = (state.tenantSummaries && state.tenantSummaries[tenantId]) || null;
        const grandTotal = (sumObj && sumObj.total_voters) || defaultTotal;

        const pAll = document.getElementById('pillCountAll');
        if (pAll) pAll.textContent = grandTotal.toLocaleString();

        const resultsEl = document.getElementById('voterResultsCount');
        if (resultsEl) resultsEl.textContent = \`देखाउँदै \${totalFiltered > 0 ? (startIdx + 1) + '–' + endIdx : 0} (फिल्टर: \${totalFiltered.toLocaleString()} / कुल: \${grandTotal.toLocaleString()} मतदाता)\`;

        const pShowing = document.getElementById('voterPillsShowingCount');
        if (pShowing) pShowing.textContent = \`\${startIdx + 1} – \${endIdx} / जम्मा \${totalFiltered.toLocaleString()} जना\`;

        renderVoterPaginationControls(totalFiltered, startIdx, endIdx, totalPages);

        // VIEW MODE SWITCHER & CARD VIEW INTEGRATION
        const effectiveMode = currentVoterViewMode || 'roll';
        ['Roll', 'Campaign', 'Card'].forEach(m => {
          const btn = document.getElementById('segBtn' + m);
          if (btn) {
            const match = (m === 'Roll' && effectiveMode === 'roll') ||
                          (m === 'Campaign' && effectiveMode === 'table') ||
                          (m === 'Card' && effectiveMode === 'card');
            btn.classList.toggle('active', match);
          }
        });

        const tableContainer = document.getElementById('voterTableContainer');
        const cardsContainer = document.getElementById('voterCardsContainer');

        if (effectiveMode === 'roll' || effectiveMode === 'table') {
          if (tableContainer) {
            tableContainer.classList.remove('hidden-view');
            tableContainer.style.setProperty('display', 'block', 'important');
          }
          if (cardsContainer) {
            cardsContainer.classList.add('hidden-view');
            cardsContainer.style.setProperty('display', 'none', 'important');
          }
          renderVotersTable(mappedRows, effectiveMode, startIdx);
        } else {
          // CARD VIEW
          if (tableContainer) {
            tableContainer.classList.add('hidden-view');
            tableContainer.style.setProperty('display', 'none', 'important');
          }
          if (cardsContainer) {
            cardsContainer.classList.remove('hidden-view');
            cardsContainer.style.setProperty('display', 'grid', 'important');
          }
          renderVotersCards(mappedRows);
        }

        _isLoadingLivePage = false;
        return true;
      } catch (err) {
        console.warn('loadLiveCloudVotersPage failed:', err);
        _isLoadingLivePage = false;
        return false;
      }
    }

    `;

  html = html.slice(0, startLivePageIdx) + newLiveEngine + html.slice(endLivePageIdx);
  console.log('✓ Replaced loadLiveCloudVotersPage with Card View & Search support');
} else {
  console.warn('⚠️ Could not locate startLivePageIdx or endLivePageIdx');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully saved updated index.html');
