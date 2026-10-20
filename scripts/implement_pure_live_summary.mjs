import fs from 'fs';

// 1. Update sw.js
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'election-ops-v31-live-summary';");
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ Updated sw.js cache name to v31-live-summary');

// 2. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// A. Bump CURRENT_APP_BUILD
html = html.replace(
  /const CURRENT_APP_BUILD = '.*?';/,
  "const CURRENT_APP_BUILD = '20261020-v31-live-summary';"
);
html = html.replace(
  /navigator\.serviceWorker\.register\('sw\.js\?v=.*?'\)/,
  "navigator.serviceWorker.register('sw.js?v=20261020-v31-live-summary')"
);
console.log('✓ Bumped CURRENT_APP_BUILD to v31-live-summary');

// B. Add tenantSummaries to initial state
if (html.includes('tenantSummaries: {},')) {
  console.log('tenantSummaries already in state');
} else {
  html = html.replace(
    'activities: [],',
    'activities: [],\n      tenantSummaries: {},'
  );
  console.log('✓ Added tenantSummaries: {} to state');
}

// C. Add helper functions getActiveTenantSummary & getActiveWardSummaryCount
const helperAnchor = `    // STRICT TENANT & WARD DATA ISOLATION ENGINE`;
const helperCode = `    // LIVE CLOUD SUMMARY & WARD-LEVEL AGGREGATION ENGINE
    function getActiveTenantSummary(tenantId) {
      if (!tenantId) tenantId = getActiveTenantId();
      if (!tenantId || tenantId === 'ALL') {
        const sums = Object.values((state && state.tenantSummaries) || {});
        if (!sums.length) return null;
        const totalV = sums.reduce((acc, s) => acc + (s.total_voters || 0), 0);
        return { total_voters: totalV, total_wards: 9, wards: [] };
      }
      return (state && state.tenantSummaries && state.tenantSummaries[tenantId]) || null;
    }

    function getActiveWardSummaryCount(wardNo, tenantId) {
      const summary = getActiveTenantSummary(tenantId);
      if (!summary || !summary.wards) return 0;
      const found = summary.wards.find(w => Number(w.ward) === Number(wardNo));
      return found ? (found.count || 0) : 0;
    }

    // STRICT TENANT & WARD DATA ISOLATION ENGINE`;

if (html.includes(helperAnchor) && !html.includes('getActiveTenantSummary')) {
  html = html.replace(helperAnchor, helperCode);
  console.log('✓ Injected getActiveTenantSummary & getActiveWardSummaryCount helpers');
} else {
  console.log('getActiveTenantSummary already present or anchor missing');
}

// D. In loadPersistedState, hydrate tenant summaries from localStorage
const loadAnchor = `    function loadPersistedState() {
      let saved = null; try { saved = localStorage.getItem(STORAGE_KEY); } catch(e) {}`;

const loadCode = `    function loadPersistedState() {
      let saved = null; try { saved = localStorage.getItem(STORAGE_KEY); } catch(e) {}
      if (!state.tenantSummaries) state.tenantSummaries = {};
      ['TNT_MVG3WXFX', 'TNT_MVF9LYO3', 'TNT_HELAMBU', 'TNT_GOKARNESHWOR_RSP'].forEach(tid => {
        try {
          const s = localStorage.getItem('tenant_summary_' + tid);
          if (s) state.tenantSummaries[tid] = JSON.parse(s);
        } catch(e) {}
      });`;

if (html.includes(loadAnchor)) {
  html = html.replace(loadAnchor, loadCode);
  console.log('✓ Added instant summary hydration in loadPersistedState');
} else {
  console.warn('⚠️ Could not match loadAnchor');
}

// E. In syncSupabaseData, fetch tenant_summary_* from system_settings
const syncSummaryAnchor = `        const [setRes, uRes, tenantsTableRes, vData] = await Promise.all([`;
const syncSummaryCode = `        // Fetch pre-computed live tenant summaries from system_settings for 0ms dashboard analytics
        try {
          const sumRes = await cloudFetch(\`\${url}/rest/v1/system_settings?key=like.tenant_summary_*\`, { headers });
          if (sumRes && sumRes.ok) {
            const sumData = await sumRes.json();
            if (Array.isArray(sumData)) {
              if (!state.tenantSummaries) state.tenantSummaries = {};
              sumData.forEach(row => {
                try {
                  const sObj = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                  if (sObj && sObj.tenant_id) {
                    state.tenantSummaries[sObj.tenant_id] = sObj;
                    try { localStorage.setItem('tenant_summary_' + sObj.tenant_id, JSON.stringify(sObj)); } catch(e) {}
                  }
                } catch(e) {}
              });
              if (currentUser && typeof refreshDashboardMetrics === 'function') {
                refreshDashboardMetrics();
              }
            }
          }
        } catch(e) {}

        const [setRes, uRes, tenantsTableRes, vData] = await Promise.all([`;

if (html.includes(syncSummaryAnchor) && !html.includes('tenant_summary_*')) {
  html = html.replace(syncSummaryAnchor, syncSummaryCode);
  console.log('✓ Injected live tenant summary cloud sync in syncSupabaseData');
} else {
  console.log('tenant_summary cloud sync already present');
}

// F. In refreshDashboardMetrics, use tenantSummary for total and KPIs
const oldTotalLine = `      const total = v.length;
      const contacted = v.filter(x => x.ContactStatus === 'Contacted').length;`;

const newTotalLine = `      const activeTId = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : '';
      const tSummary = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(activeTId) : null;
      const total = Math.max(v.length, (tSummary && tSummary.total_voters) || 0);
      const contacted = v.filter(x => x.ContactStatus === 'Contacted').length;`;

if (html.includes(oldTotalLine)) {
  html = html.replace(oldTotalLine, newTotalLine);
  console.log('✓ Updated refreshDashboardMetrics to use live cloud summary for total');
} else {
  console.warn('⚠️ Could not match oldTotalLine');
}

// G. In renderWardProgressTable, use getActiveWardSummaryCount
const oldWardProgressRow = `        const wv = scopedVoters.filter(v => Number(v.Ward || v.WardNo || 0) === w);
        const contacted = wv.filter(v => v.ContactStatus === 'Contacted').length;
        const verified = wv.filter(v => v.VerificationStatus === 'Verified').length;
        const booths = scopedBooths.filter(b => Number(b.WardNo || b.Ward || 0) === w).length;
        const issues = scopedIssues.filter(i => Number(i.WardNo || i.Ward || 0) === w && i.Status !== 'Resolved').length;
        const followups = scopedFollowups.filter(f => {
          const voter = getVoterByIdFast(f.VoterID);
          return voter && Number(voter.Ward || voter.WardNo || 0) === w && f.Status === 'Pending';
        }).length;

        html += \`
          <tr>
            <td><b>वडा \${w}</b></td>
            <td><b>\${wv.length}</b></td>`;

const newWardProgressRow = `        const wv = scopedVoters.filter(v => Number(v.Ward || v.WardNo || 0) === w);
        const wardSummaryCount = (typeof getActiveWardSummaryCount === 'function') ? getActiveWardSummaryCount(w) : 0;
        const wardVoterCount = Math.max(wv.length, wardSummaryCount);
        const contacted = wv.filter(v => v.ContactStatus === 'Contacted').length;
        const verified = wv.filter(v => v.VerificationStatus === 'Verified').length;
        const booths = scopedBooths.filter(b => Number(b.WardNo || b.Ward || 0) === w).length;
        const issues = scopedIssues.filter(i => Number(i.WardNo || i.Ward || 0) === w && i.Status !== 'Resolved').length;
        const followups = scopedFollowups.filter(f => {
          const voter = getVoterByIdFast(f.VoterID);
          return voter && Number(voter.Ward || voter.WardNo || 0) === w && f.Status === 'Pending';
        }).length;

        html += \`
          <tr>
            <td><b>वडा \${w}</b></td>
            <td><b>\${wardVoterCount.toLocaleString()}</b></td>`;

if (html.includes(oldWardProgressRow)) {
  html = html.replace(oldWardProgressRow, newWardProgressRow);
  console.log('✓ Updated renderWardProgressTable to display live ward summary counts');
} else {
  console.warn('⚠️ Could not match oldWardProgressRow');
}

// H. In renderVotersList, update pillCountAll
const oldPillAll = `      const pAll = document.getElementById('pillCountAll');
      if (pAll) pAll.textContent = scopedVoters.length;`;

const newPillAll = `      const activeCurT = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : '';
      const curSummary = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(activeCurT) : null;
      const totalScopedCount = Math.max(scopedVoters.length, (curSummary && curSummary.total_voters) || 0);
      const pAll = document.getElementById('pillCountAll');
      if (pAll) pAll.textContent = totalScopedCount.toLocaleString();`;

if (html.includes(oldPillAll)) {
  html = html.replace(oldPillAll, newPillAll);
  console.log('✓ Updated renderVotersList pillCountAll to reflect live summary');
} else {
  console.warn('⚠️ Could not match oldPillAll');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 Successfully saved Pure Live Summary in index.html!');
