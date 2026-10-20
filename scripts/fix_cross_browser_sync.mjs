import fs from 'fs';

// 1. Update sw.js
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'election-ops-v30-multitenant-sync';");
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ Updated sw.js cache name to v30-multitenant-sync');

// 2. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// A. Bump CURRENT_APP_BUILD
html = html.replace(
  /const CURRENT_APP_BUILD = '.*?';/,
  "const CURRENT_APP_BUILD = '20261020-v30-multitenant-sync';"
);
html = html.replace(
  /navigator\.serviceWorker\.register\('sw\.js\?v=.*?'\)/,
  "navigator.serviceWorker.register('sw.js?v=20261020-v30-multitenant-sync')"
);
console.log('✓ Bumped CURRENT_APP_BUILD and service worker registration URL');

// B. In topbarSupabaseSyncBtn, make click force full sync
html = html.replace(
  'onclick="syncSupabaseData(true)"',
  'onclick="syncSupabaseData(true, true)"'
);
console.log('✓ Updated topbarSupabaseSyncBtn to force full sync on user click');

// C. Smart Cloud Count comparison in syncSupabaseData
const oldSyncCheck = `        // Per-tenant sync check: Full download if this specific tenant has 0 local voters or has not completed full sync
        const scopedTenantId = getCurrentScopedTenantId();
        const tenantVoterCount = scopedTenantId ? (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === scopedTenantId).length : (state.voters || []).length;
        const syncKey = scopedTenantId ? ('EMS_SUPABASE_FULL_SYNC_DONE_' + scopedTenantId) : 'EMS_SUPABASE_FULL_SYNC_DONE';
        const hasFullSynced = !!localStorage.getItem(syncKey);
        const shouldFullFetch = forceFull || !state.voters || tenantVoterCount === 0 || !hasFullSynced;`;

const newSyncCheck = `        // Cross-Browser Deterministic Sync: First check exact cloud count in <40ms
        const scopedTenantId = getCurrentScopedTenantId();
        const tenantParam = scopedTenantId ? \`&tenant_id=eq.\${encodeURIComponent(scopedTenantId)}\` : '';
        
        let cloudTotal = -1;
        try {
          const headRes = await cloudFetch(\`\${url}/rest/v1/voters?select=voter_id\${tenantParam}&limit=1\`, {
            headers: { ...headers, 'Prefer': 'count=exact' }
          });
          const cr = headRes && headRes.headers.get('content-range');
          if (cr && cr.includes('/')) {
            cloudTotal = parseInt(cr.split('/')[1], 10);
          }
        } catch(e) {}

        const localCount = scopedTenantId 
          ? (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === scopedTenantId).length 
          : (state.voters || []).length;

        const syncKey = scopedTenantId ? ('EMS_SUPABASE_FULL_SYNC_DONE_' + scopedTenantId) : 'EMS_SUPABASE_FULL_SYNC_DONE';
        const hasFullSynced = !!localStorage.getItem(syncKey);
        
        // Full wave download triggers if:
        // 1. Force full is requested (or sync button clicked)
        // 2. Cloud has more voters than local cache (new browser or new tenant upload)
        // 3. Local count is 0 or full sync hasn't run
        const shouldFullFetch = forceFull || 
                                !state.voters || 
                                localCount === 0 || 
                                !hasFullSynced || 
                                (cloudTotal > 0 && localCount < cloudTotal);`;

if (html.includes(oldSyncCheck)) {
  html = html.replace(oldSyncCheck, newSyncCheck);
  console.log('✓ Injected fast cloud count check and auto full-fetch logic in syncSupabaseData');
} else {
  console.warn('⚠️ Could not match oldSyncCheck in index.html');
}

// D. Fetch exact tenant counts in syncSupabaseData so tenant management table is instant on all browsers
const oldTenantsFetch = `        // Process dedicated tenants table
        if (tenantsTableRes && tenantsTableRes.ok) {`;

const newTenantsFetch = `        // Process dedicated tenants table & query real-time voter counts per tenant
        if (tenantsTableRes && tenantsTableRes.ok) {
          try {
            // Asynchronously fetch exact voter count per tenant for instant cross-browser accuracy
            const countPromises = (state.tenants || []).map(async (t) => {
              if (!t.TenantID) return;
              try {
                const cRes = await cloudFetch(\`\${url}/rest/v1/voters?tenant_id=eq.\${encodeURIComponent(t.TenantID)}&select=voter_id&limit=1\`, {
                  headers: { ...headers, 'Prefer': 'count=exact' }
                });
                const cCr = cRes && cRes.headers.get('content-range');
                if (cCr && cCr.includes('/')) {
                  t.CloudVoterCount = parseInt(cCr.split('/')[1], 10);
                }
              } catch(e) {}
            });
            Promise.all(countPromises).then(() => {
              if (currentUser && currentUser.Role === 'Super Admin' && typeof renderTenantsManagement === 'function') {
                renderTenantsManagement();
              }
            }).catch(() => null);
          } catch(e) {}`;

if (html.includes(oldTenantsFetch)) {
  html = html.replace(oldTenantsFetch, newTenantsFetch);
  console.log('✓ Added async cloud voter count per tenant in syncSupabaseData');
} else {
  console.warn('⚠️ Could not match oldTenantsFetch');
}

// E. In renderTenantsManagement, use CloudVoterCount fallback
const oldTenantBadge = `                <span class="badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 6px;">
                  📊 \${((state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === t.TenantID).length).toLocaleString()} मतदाता
                </span>`;

const newTenantBadge = `                \${(() => {
                  const localC = (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === t.TenantID).length;
                  const finalC = (t.CloudVoterCount && t.CloudVoterCount > localC) ? t.CloudVoterCount : localC;
                  return \`<span class="badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 6px;">
                    📊 \${finalC.toLocaleString()} मतदाता
                  </span>\`;
                })()}`;

if (html.includes(oldTenantBadge)) {
  html = html.replace(oldTenantBadge, newTenantBadge);
  console.log('✓ Updated tenant table badge to use CloudVoterCount fallback');
} else {
  console.warn('⚠️ Could not match oldTenantBadge');
}

// F. In saasTotalPlatformVoters, use CloudVoterCount fallback
const oldTotalVotersKpi = `if (document.getElementById('saasTotalPlatformVoters')) document.getElementById('saasTotalPlatformVoters').textContent = state.voters.length;`;
const newTotalVotersKpi = `if (document.getElementById('saasTotalPlatformVoters')) {
        const sumCloud = (state.tenants || []).reduce((acc, t) => acc + (t.CloudVoterCount || (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === t.TenantID).length), 0);
        document.getElementById('saasTotalPlatformVoters').textContent = Math.max((state.voters || []).length, sumCloud).toLocaleString();
      }`;

if (html.includes(oldTotalVotersKpi)) {
  html = html.replace(oldTotalVotersKpi, newTotalVotersKpi);
  console.log('✓ Updated saasTotalPlatformVoters KPI to reflect real-time cloud counts');
} else {
  console.warn('⚠️ Could not match oldTotalVotersKpi');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 Successfully saved cross-browser sync patches in index.html!');
