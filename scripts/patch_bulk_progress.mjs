import fs from 'fs';

const filePath = 'index.html';
let raw = fs.readFileSync(filePath, 'utf8');
const isCrlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

// 1. Remove limit=500 from fetchDeltaCloudVoters
const oldDelta = `const deltaRes = await cloudFetch(\`\${url}/rest/v1/voters?select=*\${tenantParam}&updated_at=gt.\${encodeURIComponent(sinceIso)}&limit=500\`, { headers });`;
const newDelta = `const deltaRes = await cloudFetch(\`\${url}/rest/v1/voters?select=*\${tenantParam}&updated_at=gt.\${encodeURIComponent(sinceIso)}&limit=10000\`, { headers });`;
if (html.includes(oldDelta)) {
  html = html.replace(oldDelta, newDelta);
  console.log('✓ Updated delta sync limit from 500 to 10000');
} else {
  console.warn('⚠️ Could not match oldDelta');
}

// 2. In pushVotersBatchToSupabase, update live progress modal
const oldProgressUpdate = `                if (showProgressToast && totalVoters > 200) {
                  const pct = Math.round((totalSynced / totalVoters) * 100);
                  const topBadge = document.getElementById('topbarSupabaseSyncBtn');
                  if (topBadge) topBadge.innerHTML = \`<span>⏳</span> <span class="sync-label">\${pct}% (\${totalSynced})</span>\`;
                }`;

const newProgressUpdate = `                if (showProgressToast && totalVoters > 200) {
                  const pct = Math.round((totalSynced / totalVoters) * 100);
                  const topBadge = document.getElementById('topbarSupabaseSyncBtn');
                  if (topBadge) topBadge.innerHTML = \`<span>⏳</span> <span class="sync-label">\${pct}% (\${totalSynced})</span>\`;
                  
                  const bar = document.getElementById('bulkUploadProgressBar');
                  const pctEl = document.getElementById('bulkUploadProgressPct');
                  const countEl = document.getElementById('bulkUploadProgressCount');
                  if (bar) bar.style.width = pct + '%';
                  if (pctEl) pctEl.textContent = pct + '%';
                  if (countEl) countEl.textContent = \`\${totalSynced.toLocaleString()} / \${totalVoters.toLocaleString()}\`;
                }`;

if (html.includes(oldProgressUpdate)) {
  html = html.replace(oldProgressUpdate, newProgressUpdate);
  console.log('✓ Added modal progress bar updates to pushVotersBatchToSupabase');
} else {
  console.warn('⚠️ Could not match oldProgressUpdate');
}

// 3. Make executeBulkStudioImport async, show modal, and await upload
const oldExecuteImportStart = `    function executeBulkStudioImport(containerId = 'bulkStudioPreviewContainer') {`;
const newExecuteImportStart = `    async function executeBulkStudioImport(containerId = 'bulkStudioPreviewContainer') {`;

if (html.includes(oldExecuteImportStart)) {
  html = html.replace(oldExecuteImportStart, newExecuteImportStart);
  console.log('✓ Made executeBulkStudioImport async');
} else {
  console.warn('⚠️ Could not match oldExecuteImportStart');
}

// 4. Per-tenant voter mapping in existingVoterMap
const oldMapLoop = `      const existingVoterMap = new Map();
      state.voters.forEach((v, idx) => {
        const key = String(v.OfficialVoterID || v.VoterID || '').trim().toLowerCase();
        if (key) existingVoterMap.set(key, idx);
      });`;

const newMapLoop = `      const existingVoterMap = new Map();
      state.voters.forEach((v, idx) => {
        if ((v.TenantID || 'TNT_HELAMBU') === activeTenantId) {
          const key = String(v.OfficialVoterID || v.VoterID || '').trim().toLowerCase();
          if (key) existingVoterMap.set(key, idx);
        }
      });`;

if (html.includes(oldMapLoop)) {
  html = html.replace(oldMapLoop, newMapLoop);
  console.log('✓ Scoped existingVoterMap strictly per-tenant');
} else {
  console.warn('⚠️ Could not match oldMapLoop');
}

// 5. In executeBulkStudioImport, show dedicated progress modal & await batch push
const oldPushCall = `      // Automatically batch-sync newly imported/updated voters to Supabase Cloud
      if (typeof pushVotersBatchToSupabase === 'function' && selected.length > 0) {
        const recordsToPush = (newlyAddedVoters && newlyAddedVoters.length > 0) ? newlyAddedVoters : state.voters.filter(v => (v.TenantID || 'TNT_HELAMBU') === activeTenantId);
        pushVotersBatchToSupabase(recordsToPush, true);
      }

      const modal = document.getElementById('modalOverlay');
      if (modal && modal.classList.contains('active')) {
        closeModal();
      }
      switchView('voters');
      setVoterDisplayMode('roll');
      showToast(\`🎉 सफलतापूर्वक अपलोड भयो! (\${importedCount} नयाँ थपिए, \${updatedCount} अपडेट भए\${skippedCount ? ', ' + skippedCount + ' छोडिए' : ''})\`, 'success');
    }`;

const newPushCall = `      // Display live full-screen progress modal for the user
      openModal(
        '🚀 Supabase क्लाउडमा मतदाता सुरक्षित हुँदैछ...',
        \`
        <div style="padding: 24px 16px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">☁️</div>
          <h3 style="margin-bottom: 8px; color: #1e3a6e; font-weight: 800;">मतदाता सूची Supabase क्लाउडमा अपलोड हुँदैछ...</h3>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
            कृपया यो प्रक्रिया १००% पूरा नहुन्जेल ब्राउजर बन्द वा रिफ्रेस नगर्नुहोस्।<br>
            <span style="font-size:12px;color:#d97706;font-weight:700;">⚠️ Please keep this tab open until upload completes</span>
          </p>
          
          <div style="background: #e2e8f0; border-radius: 999px; height: 18px; overflow: hidden; margin-bottom: 14px; position: relative; border: 1px solid #cbd5e1;">
            <div id="bulkUploadProgressBar" style="background: linear-gradient(90deg, #2563eb, #059669); height: 100%; width: 0%; transition: width 0.25s ease;"></div>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a;">
            <span id="bulkUploadProgressPct" style="color:#2563eb;">0%</span>
            <span id="bulkUploadProgressCount" style="color:#059669;">० / \${selected.length.toLocaleString()}</span>
          </div>
        </div>
        \`,
        '',
        'modal-md'
      );

      // Prevent accidental tab reload during upload
      window.onbeforeunload = () => 'मतदाताहरू अपलोड भइरहेका छन्। के तपाईं पक्का छोड्न चाहनुहुन्छ?';

      let syncedTotal = 0;
      try {
        if (typeof pushVotersBatchToSupabase === 'function' && selected.length > 0) {
          const recordsToPush = (newlyAddedVoters && newlyAddedVoters.length > 0) ? newlyAddedVoters : state.voters.filter(v => (v.TenantID || 'TNT_HELAMBU') === activeTenantId);
          syncedTotal = await pushVotersBatchToSupabase(recordsToPush, true);
        }
      } finally {
        window.onbeforeunload = null;
      }

      openModal(
        '🎉 अपलोड सफलतापूर्वक सम्पन्न भयो!',
        \`
        <div style="padding: 24px 16px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
          <h3 style="color: #059669; font-weight: 900; margin-bottom: 8px;">Supabase क्लाउडमा सम्पूर्ण डाटा सुरक्षित भयो!</h3>
          <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">
            <b>\${(importedCount + updatedCount).toLocaleString()}</b> जना मतदाता सफलतापूर्वक <b>\${esc(activeTenantId)}</b> मा सुरक्षित गरिएको छ।
          </p>
          <button class="btn btn-primary" onclick="closeModal(); switchView('voters'); setVoterDisplayMode('roll');" style="background: #1e3a6e; font-weight: 800; padding: 10px 24px; font-size: 14px;">
            📊 मतदाता सूची हेर्नुहोस् (View Roll)
          </button>
        </div>
        \`,
        '',
        'modal-md'
      );
      showToast(\`🎉 सफलतापूर्वक अपलोड भयो! (\${importedCount} नयाँ थपिए, \${updatedCount} अपडेट भए\${skippedCount ? ', ' + skippedCount + ' छोडिए' : ''})\`, 'success');
    }`;

if (html.includes(oldPushCall)) {
  html = html.replace(oldPushCall, newPushCall);
  console.log('✓ Added live progress modal & await to executeBulkStudioImport');
} else {
  console.warn('⚠️ Could not match oldPushCall');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('🎉 Successfully saved patched index.html!');
