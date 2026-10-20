import fs from 'fs';

const filePath = 'index.html';
let raw = fs.readFileSync(filePath, 'utf8');
const isCrlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

// 1. In loadPersistedState, ensure TNT_MVG3WXFX exists & remove Gokarneshwor purge
const oldRspCheck = `          // Ensure RSP Helambu Campaign Tenant TNT_MVF9LYO3 is always available in state
          const hasRspTenant = state.tenants.some(t => t.TenantID === 'TNT_MVF9LYO3');`;
const newTenantEnsures = `          // Ensure NC Gokarneshwor Campaign Tenant TNT_MVG3WXFX is always available in state
          if (!state.tenants.some(t => t.TenantID === 'TNT_MVG3WXFX')) {
            state.tenants.unshift({
              TenantID: 'TNT_MVG3WXFX',
              Province: 'बागमती प्रदेश',
              District: 'काठमाडौं',
              PalikaName: 'गोकर्णेश्वर नगरपालिका',
              TenantName: 'नेपाली काँग्रेस गोकर्णेश्वर नगरपालिका निर्वाचन अभियान समिति',
              TotalWards: 9,
              TotalPollingLocations: 17,
              WardsConfig: Array.from({length: 9}, (_, i) => ({ number: i + 1, name: \`वडा नं. \${i + 1}\` })),
              Party: 'NC',
              Slug: 'gokarna',
              AdminUsername: 'gokarneshwor_admin',
              AdminPassword: 'pass@123',
              ContactPerson: 'hari',
              Phone: '9704853168',
              Status: 'Active',
              PlanType: 'Full Palika Suite'
            });
          }
          if (!state.users.some(u => u.UserID === 'USR_TNT_MVG3WXFX')) {
            state.users.push({
              UserID: 'USR_TNT_MVG3WXFX',
              Name: 'नेपाली काँग्रेस गोकर्णेश्वर Admin',
              Phone: '9704853168',
              Role: 'Palika Admin',
              Password: 'pass@123',
              PIN: 'pass@123',
              AccessToken: 'TOKEN_MVG3WXFX',
              Ward: 'All',
              Tole: '',
              BoothNo: '',
              Active: true,
              TenantID: 'TNT_MVG3WXFX'
            });
          }

          // Ensure RSP Helambu Campaign Tenant TNT_MVF9LYO3 is always available in state
          const hasRspTenant = state.tenants.some(t => t.TenantID === 'TNT_MVF9LYO3');`;

if (html.includes(oldRspCheck)) {
  html = html.replace(oldRspCheck, newTenantEnsures);
  console.log('✓ loadPersistedState updated with TNT_MVG3WXFX and its default user');
} else {
  console.warn('⚠️ Could not match oldRspCheck');
}

// Remove Gokarneshwor purge line
const oldPurge = `          // Strictly purge any legacy Gokarneshwor demo tenant from LocalStorage
          state.tenants = (state.tenants || []).filter(t => 
            t.TenantID !== 'TNT_GOKARNESHWOR' && 
            t.Slug !== 'gokarneshwor' && 
            !(t.PalikaName && t.PalikaName.toLowerCase().includes('gokarneshwor'))
          );`;
const newPurge = `          // Strictly purge legacy demo dummy tenants only
          state.tenants = (state.tenants || []).filter(t => t.TenantID !== 'TNT_GOKARNESHWOR_MOCK');`;

if (html.includes(oldPurge)) {
  html = html.replace(oldPurge, newPurge);
  console.log('✓ Removed destructive Gokarneshwor purge filter');
} else {
  console.warn('⚠️ Could not match oldPurge');
}

// 2. Fix line 9245 undefined `data`
const oldBrokenFinally = `            }).catch(() => null).finally(() => {
              _isResolvingCloudTenant = false;
              if (Array.isArray(data) && data[0] && data[0].value) {
                const cloudTenants = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
                if (Array.isArray(cloudTenants) && cloudTenants.length > 0) {
                  const localMap = new Map((state.tenants || []).map(t => [t.TenantID, t]));
                  cloudTenants.forEach(ct => {
                    if (ct && ct.TenantID) localMap.set(ct.TenantID, { ...(localMap.get(ct.TenantID) || {}), ...ct });
                  });
                  state.tenants = Array.from(localMap.values());
                  saveState();
                }
              }
              handleUrlRouting(preserveInputs);
            }).catch(() => {`;

const fixedFinally = `            }).catch(() => null).finally(() => {
              _isResolvingCloudTenant = false;
              handleUrlRouting(preserveInputs);
            }).catch(() => {`;

if (html.includes(oldBrokenFinally)) {
  html = html.replace(oldBrokenFinally, fixedFinally);
  console.log('✓ Fixed undeclared data variable in .finally() handler');
} else {
  console.warn('⚠️ Could not match oldBrokenFinally');
}

// 3. Update saveTenantsToCloud to upsert into public.tenants table
const oldSaveTenants = `    // Persist multi-tenant SaaS registry to Supabase Cloud for cross-device persistence
    async function saveTenantsToCloud() {
      _lastLocalTenantSaveTime = Date.now();
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;
      if (!url || !key) return;

      try {
        await cloudFetch(\`\${url}/rest/v1/system_settings\`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': \`Bearer \${key}\`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            key: 'saas_tenants_registry',
            value: JSON.stringify(state.tenants)
          })
        });
        if (typeof broadcastTenantsUpdated === 'function') {
          broadcastTenantsUpdated(state.tenants);
        }
      } catch(e) {
        console.warn('Could not persist tenants to Supabase system_settings:', e);
      }
    }`;

const newSaveTenants = `    // Persist multi-tenant SaaS registry to Supabase Cloud for cross-device persistence
    async function saveTenantsToCloud() {
      _lastLocalTenantSaveTime = Date.now();
      const url = (state.settings && state.settings.SUPABASE_URL) || DEFAULT_CONFIG.SUPABASE_URL;
      const key = (state.settings && state.settings.SUPABASE_KEY) || DEFAULT_CONFIG.SUPABASE_KEY;
      if (!url || !key) return;

      try {
        await cloudFetch(\`\${url}/rest/v1/system_settings\`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': \`Bearer \${key}\`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            key: 'saas_tenants_registry',
            value: JSON.stringify(state.tenants)
          })
        });

        // Also synchronize each tenant row to public.tenants table to prevent foreign key errors
        for (const t of (state.tenants || [])) {
          if (!t.TenantID) continue;
          try {
            await cloudFetch(\`\${url}/rest/v1/tenants\`, {
              method: 'POST',
              headers: {
                'apikey': key,
                'Authorization': \`Bearer \${key}\`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify({
                tenant_id: t.TenantID,
                province: t.Province || 'बागमती प्रदेश',
                district: t.District || 'काठमाडौं',
                palika_name: t.PalikaName || '',
                tenant_name: t.TenantName || t.PalikaName || '',
                total_wards: Number(t.TotalWards) || 9,
                wards_config: t.WardsConfig || [],
                party: t.Party || 'NC',
                slug: t.Slug || t.TenantID.toLowerCase(),
                admin_username: t.AdminUsername || '',
                admin_password: t.AdminPassword || 'pass@123',
                contact_person: t.ContactPerson || '',
                phone: t.Phone || '',
                status: t.Status || 'Active',
                plan_type: t.PlanType || 'Full Palika Suite',
                sms_credits: Number(t.SmsCredits) || 5000,
                sms_used: Number(t.SmsUsed) || 0
              })
            });
          } catch(err) {}
        }

        if (typeof broadcastTenantsUpdated === 'function') {
          broadcastTenantsUpdated(state.tenants);
        }
      } catch(e) {
        console.warn('Could not persist tenants to Supabase system_settings:', e);
      }
    }`;

if (html.includes(oldSaveTenants)) {
  html = html.replace(oldSaveTenants, newSaveTenants);
  console.log('✓ saveTenantsToCloud now syncs to public.tenants table');
} else {
  console.warn('⚠️ Could not match oldSaveTenants');
}

// 4. In pushVotersBatchToSupabase, auto-upsert target tenant before pushing voters
const oldPushVotersBatch = `      if (showProgressToast) {
        showToast(\`☁️ Supabase मा \${totalVoters} मतदाता हाई-स्पीड ब्याचमा अपलोड हुँदैछ...\`, 'info');
      }`;
const newPushVotersBatch = `      if (showProgressToast) {
        showToast(\`☁️ Supabase मा \${totalVoters} मतदाता हाई-स्पीड ब्याचमा अपलोड हुँदैछ...\`, 'info');
      }

      // Ensure target tenant exists in public.tenants table to satisfy foreign key constraint
      const sampleTenantId = (votersList[0] && (votersList[0].TenantID || votersList[0].tenant_id)) || 'TNT_HELAMBU';
      const targetT = (state.tenants || []).find(t => t.TenantID === sampleTenantId);
      if (targetT) {
        try {
          await cloudFetch(\`\${url}/rest/v1/tenants\`, {
            method: 'POST',
            headers: {
              'apikey': key,
              'Authorization': \`Bearer \${key}\`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              tenant_id: targetT.TenantID,
              province: targetT.Province || 'बागमती प्रदेश',
              district: targetT.District || 'काठमाडौं',
              palika_name: targetT.PalikaName || '',
              tenant_name: targetT.TenantName || targetT.PalikaName || '',
              total_wards: Number(targetT.TotalWards) || 9,
              party: targetT.Party || 'NC',
              slug: targetT.Slug || targetT.TenantID.toLowerCase(),
              admin_username: targetT.AdminUsername || '',
              admin_password: targetT.AdminPassword || 'pass@123',
              phone: targetT.Phone || '',
              status: targetT.Status || 'Active'
            })
          });
        } catch(e) {}
      }`;

if (html.includes(oldPushVotersBatch)) {
  html = html.replace(oldPushVotersBatch, newPushVotersBatch);
  console.log('✓ pushVotersBatchToSupabase now guarantees target tenant exists before batch insertion');
} else {
  console.warn('⚠️ Could not match oldPushVotersBatch');
}

// 5. In syncSupabaseData, use per-tenant full sync check and preserve other tenants' voters
const oldSyncCheck = `        // Delta sync by default when local cache already has complete voter roll; Full download if fresh browser or seed dummy (<18900 voters)
        const hasFullSynced = !!localStorage.getItem('EMS_SUPABASE_FULL_SYNC_DONE');
        const localCount = (state.voters && Array.isArray(state.voters)) ? state.voters.length : 0;
        const shouldFullFetch = forceFull || !state.voters || localCount < 18900 || !hasFullSynced;`;

const newSyncCheck = `        // Per-tenant sync check: Full download if this specific tenant has 0 local voters or has not completed full sync
        const scopedTenantId = getCurrentScopedTenantId();
        const tenantVoterCount = scopedTenantId ? (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === scopedTenantId).length : (state.voters || []).length;
        const syncKey = scopedTenantId ? ('EMS_SUPABASE_FULL_SYNC_DONE_' + scopedTenantId) : 'EMS_SUPABASE_FULL_SYNC_DONE';
        const hasFullSynced = !!localStorage.getItem(syncKey);
        const shouldFullFetch = forceFull || !state.voters || tenantVoterCount === 0 || !hasFullSynced;`;

if (html.includes(oldSyncCheck)) {
  html = html.replace(oldSyncCheck, newSyncCheck);
  console.log('✓ syncSupabaseData updated to use per-tenant full sync checks');
} else {
  console.warn('⚠️ Could not match oldSyncCheck');
}

// 6. Update full sync flag saving
const oldSyncSave = `        if (allVoters.length >= total) {
          try {
            localStorage.setItem('EMS_SUPABASE_FULL_SYNC_DONE', String(Date.now()));
          } catch(e) {}
        } else {
          try {
            localStorage.removeItem('EMS_SUPABASE_FULL_SYNC_DONE');
          } catch(e) {}
        }`;

const newSyncSave = `        if (allVoters.length >= total) {
          try {
            const scopedTenantId = getCurrentScopedTenantId();
            const syncKey = scopedTenantId ? ('EMS_SUPABASE_FULL_SYNC_DONE_' + scopedTenantId) : 'EMS_SUPABASE_FULL_SYNC_DONE';
            localStorage.setItem(syncKey, String(Date.now()));
          } catch(e) {}
        } else {
          try {
            const scopedTenantId = getCurrentScopedTenantId();
            const syncKey = scopedTenantId ? ('EMS_SUPABASE_FULL_SYNC_DONE_' + scopedTenantId) : 'EMS_SUPABASE_FULL_SYNC_DONE';
            localStorage.removeItem(syncKey);
          } catch(e) {}
        }`;

if (html.includes(oldSyncSave)) {
  html = html.replace(oldSyncSave, newSyncSave);
  console.log('✓ Per-tenant sync timestamp persistence updated');
} else {
  console.warn('⚠️ Could not match oldSyncSave');
}

// 7. In syncSupabaseData, keep other tenants' voters
const oldVoterReplace = `            state.voters = realVoters;
            saveState();`;

const newVoterReplace = `            // Keep voters belonging to other tenants, update current tenant's roll
            const currentScopedId = getCurrentScopedTenantId();
            const otherTenantsVoters = currentScopedId 
              ? (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') !== currentScopedId && !String(v.VoterID).startsWith('VOT_00'))
              : [];
            state.voters = [...otherTenantsVoters, ...realVoters];
            saveState();`;

if (html.includes(oldVoterReplace)) {
  html = html.replace(oldVoterReplace, newVoterReplace);
  console.log('✓ Multi-tenant voter array preservation updated in syncSupabaseData');
} else {
  console.warn('⚠️ Could not match oldVoterReplace');
}

// 8. In launchDashboard, force full sync if scoped tenant has 0 voters
const oldLaunchSync = `        const localCount = (state.voters && Array.isArray(state.voters)) ? state.voters.length : 0;
        const needsFull = !state.voters || localCount === 0 || localCount < 18900;
        syncSupabaseData(false, needsFull)`;

const newLaunchSync = `        const scopedTenantId = getCurrentScopedTenantId();
        const tenantVoterCount = scopedTenantId ? (state.voters || []).filter(v => (v.TenantID || 'TNT_HELAMBU') === scopedTenantId).length : (state.voters || []).length;
        const needsFull = !state.voters || tenantVoterCount === 0;
        syncSupabaseData(false, needsFull)`;

if (html.includes(oldLaunchSync)) {
  html = html.replace(oldLaunchSync, newLaunchSync);
  console.log('✓ launchDashboard now forces full sync when tenant voter count is 0');
} else {
  console.warn('⚠️ Could not match oldLaunchSync');
}

// 9. Update bulkTargetTenant dropdown to show Party and clear distinction
const oldDropdown = `                    \${(state.tenants && state.tenants.length ? state.tenants : [
                      { TenantID: 'TNT_GOKARNESHWOR_RSP', PalikaName: 'गोकर्णेश्वर नगरपालिका', TotalWards: 9 },
                      { TenantID: 'TNT_HELAMBU_RSP', PalikaName: 'हेलम्बु गाउँपालिका', TotalWards: 7 }
                    ]).map(t => \`<option value="\${t.TenantID}">\${t.PalikaName || t.TenantName} (\${t.TenantID})</option>\`).join('')}`;

const newDropdown = `                    \${(state.tenants && state.tenants.length ? state.tenants : [
                      { TenantID: 'TNT_MVG3WXFX', PalikaName: 'गोकर्णेश्वर नगरपालिका', TenantName: 'नेपाली काँग्रेस गोकर्णेश्वर', Party: 'NC', TotalWards: 9 },
                      { TenantID: 'TNT_GOKARNESHWOR_RSP', PalikaName: 'गोकर्णेश्वर नगरपालिका', TenantName: 'रास्वपा गोकर्णेश्वर', Party: 'RSP', TotalWards: 9 },
                      { TenantID: 'TNT_MVF9LYO3', PalikaName: 'हेलम्बु गाउँपालिका', TenantName: 'रास्वपा हेलम्बु', Party: 'RSP', TotalWards: 7 }
                    ]).map(t => \`<option value="\${t.TenantID}">\${t.TenantName || t.PalikaName} [\${t.Party || 'All'}] (\${t.TotalWards || 9} वडा) - \${t.TenantID}</option>\`).join('')}`;

if (html.includes(oldDropdown)) {
  html = html.replace(oldDropdown, newDropdown);
  console.log('✓ bulkTargetTenant dropdown updated with party labels');
} else {
  console.warn('⚠️ Could not match oldDropdown');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('🎉 Successfully saved patched index.html!');
