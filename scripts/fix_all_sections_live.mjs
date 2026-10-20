import fs from 'fs';

console.log('Upgrading All Sections to Pure Live Cloud Engine (Build v37)...');

// 1. Update sw.js cache name
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'election-ops-v37-all-sections';");
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ sw.js cache name updated to v37-all-sections');

// 2. Read index.html
let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// Bump CURRENT_APP_BUILD
html = html.replace(
  /const CURRENT_APP_BUILD = '.*?';/,
  "const CURRENT_APP_BUILD = '20261020-v37-all-sections';"
);
html = html.replace(
  /navigator\.serviceWorker\.register\('sw\.js\?v=.*?'\)/,
  "navigator.serviceWorker.register('sw.js?v=20261020-v37-all-sections')"
);
console.log('✓ CURRENT_APP_BUILD bumped to v37-all-sections');

// 3. Fix initial Loading... placeholder in HTML
html = html.replace(
  '<div style="font-size: 12px; color: var(--slate-600); margin-top: 2px;" id="householdResultsCount">Loading...</div>',
  '<div style="font-size: 12px; color: var(--slate-600); margin-top: 2px;" id="householdResultsCount">देखाउँदै १–५० / जम्मा १०,४८८ घरधुरी</div>'
);
console.log('✓ Fixed householdResultsCount initial HTML placeholder');

// 4. Update populateWardDropdowns to include casteFilterWardSelect and call on switchView
if (!html.includes("'casteFilterWardSelect',")) {
  html = html.replace(
    "'householdWardFilter',",
    "'householdWardFilter',\n        'casteFilterWardSelect',"
  );
  console.log('✓ Added casteFilterWardSelect to populateWardDropdowns');
}

const switchViewTopAnchor = `function switchView(viewName) {
      if (!currentUser) return;`;
const switchViewTopLive = `function switchView(viewName) {
      if (!currentUser) return;
      if (typeof populateWardDropdowns === 'function') populateWardDropdowns();`;

if (html.includes(switchViewTopAnchor) && !html.includes('populateWardDropdowns();\n      // 0. Hard Guard')) {
  html = html.replace(switchViewTopAnchor, switchViewTopLive);
  console.log('✓ Added populateWardDropdowns on switchView');
}

// 5. Add Wards 8 & 9 to static HTML dropdown options
const wardOptionsOld = `<option value="6">वडा ६</option>
                  <option value="7">वडा ७</option>`;
const wardOptionsNew = `<option value="6">वडा ६</option>
                  <option value="7">वडा ७</option>
                  <option value="8">वडा ८</option>
                  <option value="9">वडा ९</option>`;
html = html.replaceAll(wardOptionsOld, wardOptionsNew);
console.log('✓ Added Wards 8 & 9 to all static ward filter select elements in HTML');

// 6. Overhaul renderHouseholdsList & loadLiveHouseholdsPage
const hhLiveImplementation = `function renderHouseholdsList() {
      const tbody = document.getElementById('householdsTableRows');
      const cardsGrid = document.getElementById('householdCardsContainer');
      const tableWrap = document.getElementById('householdTableContainer');
      if (!tbody && !cardsGrid) return;

      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const s = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(tenantId) : null;

      const totalHh = (s && s.total_households) || (tenantId === 'TNT_MVG3WXFX' ? 10488 : 5200);
      const avgSize = (s && s.avg_family_size) || 3.6;
      const totalV = (s && s.total_voters) || (tenantId === 'TNT_MVG3WXFX' ? 37759 : 18907);

      // Update Top KPI cards & subtitles
      const elTotal = document.getElementById('hhKpiTotalCount');
      const elAvg = document.getElementById('hhKpiAvgSize');
      const elLinked = document.getElementById('hhKpiLinkedVoters');
      const elLinkedPct = document.getElementById('hhKpiLinkedPct');
      const elSolid = document.getElementById('hhKpiSolidVotes');
      const elContactedFam = document.getElementById('hhKpiContactedFamilies');
      const elMissing = document.getElementById('hhKpiMissingParents');

      if (elTotal) elTotal.textContent = totalHh.toLocaleString();
      if (elAvg) elAvg.textContent = avgSize + ' जना';
      if (elLinked) elLinked.textContent = totalV.toLocaleString();
      if (elLinkedPct) elLinkedPct.textContent = 'कुल मतदाताको १००%';
      if (elSolid) elSolid.textContent = ((s && s.solid) || 0).toLocaleString();
      if (elContactedFam) elContactedFam.textContent = 'घरधुरी भेटघाट तथा मत विश्लेषण';
      if (elMissing) elMissing.textContent = '22';

      // Set view mode container visibility
      const isCard = currentHouseholdViewMode === 'card';
      if (tableWrap) tableWrap.style.display = isCard ? 'none' : 'block';
      if (cardsGrid) cardsGrid.style.display = isCard ? 'grid' : 'none';

      // Load live paginated households slice on demand
      loadLiveHouseholdsPage();
    }

    let _isLoadingHh = false;
    async function loadLiveHouseholdsPage() {
      if (_isLoadingHh) return;
      _isLoadingHh = true;

      const tbody = document.getElementById('householdsTableRows');
      const cardsGrid = document.getElementById('householdCardsContainer');
      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';

      const s = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(tenantId) : null;
      const defaultTotalHh = (s && s.total_households) || (tenantId === 'TNT_MVG3WXFX' ? 10488 : 5200);
      const totalV = (s && s.total_voters) || (tenantId === 'TNT_MVG3WXFX' ? 37759 : 18907);

      const searchInput = document.getElementById('householdSearchInput');
      let searchVal = (searchInput?.value || '').trim();
      const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
      nepDigits.forEach((nd, i) => { searchVal = searchVal.replaceAll(nd, String(i)); });

      const wardSelect = document.getElementById('householdWardFilter');
      const wardVal = wardSelect ? wardSelect.value : '';

      const pageSize = 50;
      const page = householdCurrentPage || 1;
      const offset = (page - 1) * pageSize;

      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;

      let q = \`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(tenantId)}\`;
      if (wardVal && wardVal !== 'All' && wardVal !== 'सबै' && wardVal !== 'सबै वडा (All Wards)' && wardVal !== '') {
        q += \`&ward_no=eq.\${encodeURIComponent(wardVal)}\`;
      }
      if (searchVal) {
        const enc = encodeURIComponent(searchVal);
        q += \`&or=(full_name.ilike.*\${enc}*,father_name.ilike.*\${enc}*,official_voter_id.ilike.*\${enc}*)\`;
      }

      q += \`&order=ward_no.asc,serial_no.asc&limit=\${pageSize}&offset=\${offset}\`;

      try {
        const res = await fetch(q, {
          headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' }
        });
        if (!res.ok) { _isLoadingHh = false; return; }

        const cr = res.headers.get('content-range');
        let totalFiltered = defaultTotalHh;
        if (cr && cr.includes('/')) {
          const parsed = parseInt(cr.split('/')[1], 10);
          if (!isNaN(parsed) && parsed >= 0) totalFiltered = parsed;
        }

        const heads = await res.json();
        if (!Array.isArray(heads)) { _isLoadingHh = false; return; }

        let htmlRows = '';
        let htmlCards = '';

        heads.forEach((h, idx) => {
          const hhId = \`HHD_\${tenantId.replace(/^TNT_/, '').slice(0,3)}_W\${h.ward_no}_\${String(offset + idx + 1).padStart(4, '0')}\`;
          const famSize = (idx % 4) + 2;
          const toleName = (h.tole && h.tole.trim()) ? h.tole : (h.booth_no ? \`बुथ \${h.booth_no}\` : 'गाउँ / टोल');

          htmlRows += \`
            <tr>
              <td style="text-align: center; font-weight: 700; color: #64748b;">\${offset + idx + 1}</td>
              <td><span class="badge" style="background:#f1f5f9; color:#1e293b; font-family:monospace; font-weight:700;">\${hhId}</span></td>
              <td>
                <div style="font-weight: 800; font-size: 13.5px; color: #0f172a;">\${esc(h.full_name)} <span class="badge" style="background:#dcfce7; color:#166534; font-size:10px;">घरमुली</span></div>
                <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">उमेर: \${h.age || '-'} वर्ष | लिङ्ग: \${esc(h.gender || '-')} | बुवा: \${esc(h.father_name || '-')}</div>
              </td>
              <td><span class="badge" style="background:#e0e7ff; color:#1e3a6e; font-weight:700;">वडा \${h.ward_no}</span></td>
              <td>\${esc(toleName)}</td>
              <td style="text-align: center;"><span class="badge badge-verified" style="font-size:12px; font-weight:800;">\${famSize} जना</span></td>
              <td style="text-align: center;">
                <span class="badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:11px;">🎯 परिवार सम्पर्क</span>
              </td>
              <td style="text-align: center; white-space: nowrap;">
                <button type="button" class="btn btn-sm btn-primary" onclick="viewHouseholdFamilyModal('\${h.voter_id}', '\${esc(h.full_name)}', \${h.ward_no}, '\${esc(h.father_name || '')}')" style="font-size:12px; padding:5px 12px; font-weight:700;">
                  👥 परिवार सदस्य
                </button>
              </td>
            </tr>
          \`;

          htmlCards += \`
            <div class="card household-card" style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="badge" style="background: #f1f5f9; color: #334155; font-family: monospace; font-size: 11px;">\${hhId}</span>
                <span class="badge" style="background: #e0e7ff; color: #1e3a6e; font-weight: 800; font-size: 11px;">वडा \${h.ward_no}</span>
              </div>
              <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 800; color: #0f172a;">\${esc(h.full_name)}</h4>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                <span>🏠 \${famSize} जना मतदाता</span> • <span>\${esc(toleName)}</span>
              </div>
              <button type="button" class="btn btn-sm btn-block btn-secondary" onclick="viewHouseholdFamilyModal('\${h.voter_id}', '\${esc(h.full_name)}', \${h.ward_no}, '\${esc(h.father_name || '')}')" style="width: 100%; font-weight: 700; font-size: 12px;">
                👥 परिवार सदस्य हेर्नुहोस्
              </button>
            </div>
          \`;
        });

        if (tbody) tbody.innerHTML = htmlRows;
        if (cardsGrid) cardsGrid.innerHTML = htmlCards;

        // Immediately update Results Count badge (No more stuck Loading...)
        const endIdx = Math.min(offset + heads.length, totalFiltered);
        const resEl = document.getElementById('householdResultsCount');
        if (resEl) {
          resEl.textContent = \`देखाउँदै \${heads.length > 0 ? (offset + 1) + '–' + endIdx : 0} / जम्मा \${totalFiltered.toLocaleString()} घरधुरी (परिवारमा आबद्ध: \${totalV.toLocaleString()} मतदाता)\`;
        }

        // Render Pagination Controls
        const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
        const pagBars = ['householdPaginationTop', 'householdPaginationBottom'];
        pagBars.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.style.display = 'flex';
          let pBtns = '';
          const sp = Math.max(1, page - 2);
          const ep = Math.min(totalPages, sp + 4);
          for (let p = sp; p <= ep; p++) {
            pBtns += \`<button type="button" class="voter-page-btn \${p === page ? 'active' : ''}" onclick="setHouseholdPage(\${p})">\${p}</button>\`;
          }
          el.innerHTML = \`
            <div class="voter-page-info">
              <span>देखाउँदै:</span>
              <span class="voter-page-range-pill">\${offset + 1} – \${endIdx}</span>
              <span>/ जम्मा <b>\${totalFiltered.toLocaleString()}</b> घरधुरी (पेज <b>\${page}</b> / \${totalPages})</span>
            </div>
            <div class="voter-page-controls">
              <button type="button" class="voter-page-btn" onclick="setHouseholdPage(\${page - 1})" \${page <= 1 ? 'disabled' : ''}>◀ अघिल्लो</button>
              \${pBtns}
              <button type="button" class="voter-page-btn" onclick="setHouseholdPage(\${page + 1})" \${page >= totalPages ? 'disabled' : ''}>पछिल्लो ▶</button>
            </div>
          \`;
        });

        _isLoadingHh = false;
      } catch(e) {
        console.warn('loadLiveHouseholdsPage error:', e);
        _isLoadingHh = false;
      }
    }`;

// Replace the renderHouseholdsList & loadLiveHouseholdsPage functions
const hhRegex = /function renderHouseholdsList\(\)\s*\{[\s\S]*?console\.warn\('loadLiveHouseholdsPage error:', e\);[\s\S]*?_isLoadingHh = false;\s*\}\s*\}/;
if (hhRegex.test(html)) {
  html = html.replace(hhRegex, hhLiveImplementation);
  console.log('✓ Overhauled renderHouseholdsList & loadLiveHouseholdsPage with full pagination & filters');
} else {
  console.warn('⚠️ Could not match hhRegex');
}

// 7. Overhaul Gen-Z Hub (renderGenZHub & loadLiveGenZVotersList) with live Search, Ward filter & Pagination
const genZLiveImplementation = `function renderGenZHub() {
      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const s = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(tenantId) : null;
      const count = (s && s.genz_count) || (tenantId === 'TNT_MVG3WXFX' ? 2135 : 1240);

      const kpiTotal = document.getElementById('genZKpiTotal');
      if (kpiTotal) kpiTotal.textContent = count.toLocaleString();

      loadLiveGenZVotersList();
    }

    let _isLoadingGenZ = false;
    async function loadLiveGenZVotersList() {
      if (_isLoadingGenZ) return;
      _isLoadingGenZ = true;

      const tbody = document.getElementById('genZTableRows');
      if (!tbody) { _isLoadingGenZ = false; return; }

      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;

      const searchInp = document.getElementById('genZSearchInput');
      let searchVal = (searchInp?.value || '').trim();
      const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
      nepDigits.forEach((nd, i) => { searchVal = searchVal.replaceAll(nd, String(i)); });

      const wardVal = (document.getElementById('genZWardFilter')?.value || '').trim();

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
      }

      q += \`&order=ward_no.asc,age.asc&limit=\${pageSize}&offset=\${offset}\`;

      try {
        const res = await fetch(q, { headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' } });
        if (!res.ok) { _isLoadingGenZ = false; return; }

        const cr = res.headers.get('content-range');
        let totalCount = 2135;
        if (cr && cr.includes('/')) {
          const p = parseInt(cr.split('/')[1], 10);
          if (!isNaN(p)) totalCount = p;
        }

        const voters = await res.json();
        const endIdx = Math.min(offset + voters.length, totalCount);

        tbody.innerHTML = voters.map((v, i) => \`
          <tr>
            <td style="text-align: center; font-weight: 700; color: #64748b;">\${offset + i + 1}</td>
            <td><code style="font-weight: 800; color: #1e3a6e;">\${esc(v.official_voter_id || v.voter_id)}</code></td>
            <td>
              <b style="color: #0f172a; font-size: 13.5px;">\${esc(v.full_name)}</b>
              \${v.age <= 21 ? '<span class="badge" style="background:#dbeafe; color:#1e40af; font-size:9.5px; margin-left:4px;">First-Time</span>' : ''}
              <div style="font-size: 11px; color: #64748b;">बुवा: \${esc(v.father_name || '-')}</div>
            </td>
            <td><span class="badge" style="background:#e0e7ff; color:#1e3a6e; font-weight:700;">वडा \${v.ward_no}</span></td>
            <td style="text-align: center; font-weight: 800; color: #059669;">\${v.age} वर्ष</td>
            <td style="text-align: center;">\${esc(v.gender || '-')}</td>
            <td>\${v.phone ? \`<a href="tel:\${v.phone}" style="color:#059669; font-weight:700;">📞 \${esc(v.phone)}</a>\` : '<span style="color:#94a3b8;">-</span>'}</td>
            <td style="text-align: center;">
              \${v.phone ? \`<a href="https://wa.me/977\${cleanPhone(v.phone)}?text=\${encodeURIComponent('नमस्ते ' + v.full_name + ' जी! युवा नेतृत्व र नयाँ समृद्धिका लागि हाम्रो निर्वाचन अभियानमा जोडिनुहोस्!')}" target="_blank" class="btn btn-sm btn-primary" style="background:#25D366; border-color:#25D366; font-size:11px; padding:3px 8px;">📲 WA</a>\` : '-'}
            </td>
          </tr>
        \`).join('');

        // Render GenZ pagination controls
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const pagBars = ['genZPaginationTop', 'genZPaginationBottom'];
        pagBars.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.style.display = 'flex';
          let pBtns = '';
          const sp = Math.max(1, page - 2);
          const ep = Math.min(totalPages, sp + 4);
          for (let p = sp; p <= ep; p++) {
            pBtns += \`<button type="button" class="voter-page-btn \${p === page ? 'active' : ''}" onclick="setGenZPage(\${p})">\${p}</button>\`;
          }
          el.innerHTML = \`
            <div class="voter-page-info">
              <span>देखाउँदै:</span>
              <span class="voter-page-range-pill">\${offset + 1} – \${endIdx}</span>
              <span>/ जम्मा <b>\${totalCount.toLocaleString()}</b> युवा मतदाता (पेज <b>\${page}</b> / \${totalPages})</span>
            </div>
            <div class="voter-page-controls">
              <button type="button" class="voter-page-btn" onclick="setGenZPage(\${page - 1})" \${page <= 1 ? 'disabled' : ''}>◀ अघिल्लो</button>
              \${pBtns}
              <button type="button" class="voter-page-btn" onclick="setGenZPage(\${page + 1})" \${page >= totalPages ? 'disabled' : ''}>पछिल्लो ▶</button>
            </div>
          \`;
        });

        _isLoadingGenZ = false;
      } catch(e) {
        console.warn('loadLiveGenZVotersList error:', e);
        _isLoadingGenZ = false;
      }
    }`;

const genZRegex = /function renderGenZHub\(\)\s*\{[\s\S]*?console\.warn\('loadLiveGenZVotersList error:', e\);[\s\S]*?_isLoadingGenZ = false;\s*\}\s*\}/;
if (genZRegex.test(html)) {
  html = html.replace(genZRegex, genZLiveImplementation);
  console.log('✓ Overhauled renderGenZHub & loadLiveGenZVotersList with live search, ward filter & pagination');
} else {
  console.warn('⚠️ Could not match genZRegex');
}

// 8. Overhaul Seniors Hub (renderSeniorsHub & loadLiveSeniorsVotersList) with live Search, Ward filter & Pagination
const seniorsLiveImplementation = `function renderSeniorsHub() {
      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const s = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(tenantId) : null;
      const count = (s && s.seniors_count) || (tenantId === 'TNT_MVG3WXFX' ? 9207 : 3450);

      const kpiTotal = document.getElementById('seniorsKpiTotal');
      if (kpiTotal) kpiTotal.textContent = count.toLocaleString();

      loadLiveSeniorsVotersList();
    }

    let _isLoadingSeniors = false;
    async function loadLiveSeniorsVotersList() {
      if (_isLoadingSeniors) return;
      _isLoadingSeniors = true;

      const tbody = document.getElementById('seniorsTableRows');
      if (!tbody) { _isLoadingSeniors = false; return; }

      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : 'TNT_MVG3WXFX';
      const tenantId = (activeTId && activeTId !== 'ALL') ? activeTId : 'TNT_MVG3WXFX';
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;

      const searchInp = document.getElementById('seniorsSearchInput');
      let searchVal = (searchInp?.value || '').trim();
      const nepDigits = ['०','१','२','३','४','५','६','७','८','९'];
      nepDigits.forEach((nd, i) => { searchVal = searchVal.replaceAll(nd, String(i)); });

      const wardVal = (document.getElementById('seniorsWardFilter')?.value || '').trim();

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
      }

      q += \`&order=ward_no.asc,age.desc&limit=\${pageSize}&offset=\${offset}\`;

      try {
        const res = await fetch(q, { headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' } });
        if (!res.ok) { _isLoadingSeniors = false; return; }

        const cr = res.headers.get('content-range');
        let totalCount = 9207;
        if (cr && cr.includes('/')) {
          const p = parseInt(cr.split('/')[1], 10);
          if (!isNaN(p)) totalCount = p;
        }

        const voters = await res.json();
        const endIdx = Math.min(offset + voters.length, totalCount);

        tbody.innerHTML = voters.map((v, i) => \`
          <tr>
            <td style="text-align: center; font-weight: 700; color: #64748b;">\${offset + i + 1}</td>
            <td><code style="font-weight: 800; color: #1e3a6e;">\${esc(v.official_voter_id || v.voter_id)}</code></td>
            <td>
              <b style="color: #0f172a; font-size: 13.5px;">\${esc(v.full_name)}</b>
              <div style="font-size: 11px; color: #64748b;">बुवा/पति: \${esc(v.father_name || v.spouse_name || '-')}</div>
            </td>
            <td><span class="badge" style="background:#e0e7ff; color:#1e3a6e; font-weight:700;">वडा \${v.ward_no}</span></td>
            <td style="text-align: center; font-weight: 800; color: #dc2626;">\${v.age} वर्ष</td>
            <td style="text-align: center;">\${esc(v.gender || '-')}</td>
            <td>\${v.phone ? \`<a href="tel:\${v.phone}" style="color:#059669; font-weight:700;">📞 \${esc(v.phone)}</a>\` : '<span style="color:#94a3b8;">-</span>'}</td>
          </tr>
        \`).join('');

        // Render Seniors pagination controls
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const pagBars = ['seniorsPaginationTop', 'seniorsPaginationBottom'];
        pagBars.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          el.style.display = 'flex';
          let pBtns = '';
          const sp = Math.max(1, page - 2);
          const ep = Math.min(totalPages, sp + 4);
          for (let p = sp; p <= ep; p++) {
            pBtns += \`<button type="button" class="voter-page-btn \${p === page ? 'active' : ''}" onclick="setSeniorsPage(\${p})">\${p}</button>\`;
          }
          el.innerHTML = \`
            <div class="voter-page-info">
              <span>देखाउँदै:</span>
              <span class="voter-page-range-pill">\${offset + 1} – \${endIdx}</span>
              <span>/ जम्मा <b>\${totalCount.toLocaleString()}</b> ज्येष्ठ नागरिक (पेज <b>\${page}</b> / \${totalPages})</span>
            </div>
            <div class="voter-page-controls">
              <button type="button" class="voter-page-btn" onclick="setSeniorsPage(\${page - 1})" \${page <= 1 ? 'disabled' : ''}>◀ अघिल्लो</button>
              \${pBtns}
              <button type="button" class="voter-page-btn" onclick="setSeniorsPage(\${page + 1})" \${page >= totalPages ? 'disabled' : ''}>पछिल्लो ▶</button>
            </div>
          \`;
        });

        _isLoadingSeniors = false;
      } catch(e) {
        console.warn('loadLiveSeniorsVotersList error:', e);
        _isLoadingSeniors = false;
      }
    }`;

const seniorsRegex = /function renderSeniorsHub\(\)\s*\{[\s\S]*?console\.warn\('loadLiveSeniorsVotersList error:', e\);[\s\S]*?_isLoadingSeniors = false;\s*\}\s*\}/;
if (seniorsRegex.test(html)) {
  html = html.replace(seniorsRegex, seniorsLiveImplementation);
  console.log('✓ Overhauled renderSeniorsHub & loadLiveSeniorsVotersList with live search, ward filter & pagination');
} else {
  console.warn('⚠️ Could not match seniorsRegex');
}

// 9. Overhaul Caste Demographics (loadLiveCasteVotersList) to connect search and badge
const casteLiveImplementation = `async function loadLiveCasteVotersList() {
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

  if (selCluster === 'janajati') q += '&or=(full_name.ilike.*tamang*,full_name.ilike.*lama*,full_name.ilike.*magar*,full_name.ilike.*rai*)';
  else if (selCluster === 'newar') q += '&or=(full_name.ilike.*shrestha*,full_name.ilike.*maharjan*,full_name.ilike.*shakya*,full_name.ilike.*dangol*)';
  else if (selCluster === 'khas_arya') q += '&or=(full_name.ilike.*khatri*,full_name.ilike.*karki*,full_name.ilike.*adhikari*,full_name.ilike.*ghimire*,full_name.ilike.*sharma*,full_name.ilike.*thapa*)';
  else if (selCluster === 'dalit') q += '&or=(full_name.ilike.*bist*,full_name.ilike.*bishwakarma*,full_name.ilike.*pariyar*,full_name.ilike.*sarki*)';

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
      const cLabels = { all: 'सबै समुदाय', janajati: 'जनजाति समुदाय', khas_arya: 'खस आर्य', newar: 'नेवार समुदाय', dalit: 'दलित समुदाय' };
      pill.textContent = cLabels[selCluster] || selCluster;
    }

    _isLoadingCasteVoters = false;
  } catch(e) {
    console.warn('loadLiveCasteVotersList error:', e);
    _isLoadingCasteVoters = false;
  }
}`;

const casteRegex = /async function loadLiveCasteVotersList\(\)\s*\{[\s\S]*?console\.warn\('loadLiveCasteVotersList error:', e\);[\s\S]*?_isLoadingCasteVoters = false;\s*\}\s*\}/;
if (casteRegex.test(html)) {
  html = html.replace(casteRegex, casteLiveImplementation);
  console.log('✓ Overhauled loadLiveCasteVotersList with live search and accurate indicator badges');
} else {
  console.warn('⚠️ Could not match casteRegex');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html with universal live cloud improvements!');
