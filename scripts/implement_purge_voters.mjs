import fs from 'fs';

console.log('Injecting UI buttons for Purge Voter Roll...');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Table Action Button
const needle1 = `onclick="event.stopPropagation(); openBulkVoterImportModalForTenant('\${t.TenantID}')"`;
const idx1 = html.indexOf(needle1);
if (idx1 !== -1) {
  const endButtonIdx = html.indexOf('</button>', idx1);
  if (endButtonIdx !== -1) {
    const afterBtn = endButtonIdx + '</button>'.length;
    const purgeBtnHtml = `\n                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); openPurgeTenantVotersModal('\${t.TenantID}')" style="background: #dc2626; color: white; border: 1px solid #b91c1c; font-weight: 800; font-size: 11.5px; padding: 5px 9px; border-radius: 6px; box-shadow: 0 1px 3px rgba(220,38,38,0.2);" title="यस पालिकाको सम्पूर्ण मतदाता सूची डाटाबेसबाट १-क्लिकमा सफा गर्नुहोस्">\n                  🗑️ मतदाता सफा\n                </button>`;
    html = html.slice(0, afterBtn) + purgeBtnHtml + html.slice(afterBtn);
    console.log('✓ Added Purge button in Tenant Management table row');
  }
} else {
  console.warn('⚠️ Could not find needle1');
}

// 2. Dossier Voters Tab CTA Banner
const needle2 = `onclick="closeModal(); openSuperAdmin3TierImportStudio('\${tenantId}')"`;
const idx2 = html.indexOf(needle2);
if (idx2 !== -1) {
  // Find opening of button
  const startBtn = html.lastIndexOf('<button', idx2);
  const endBtn = html.indexOf('</button>', idx2) + '</button>'.length;
  const originalBtn = html.slice(startBtn, endBtn);
  const replacement = `<div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${originalBtn}
              <button type="button" class="btn btn-danger" onclick="openPurgeTenantVotersModal('\${tenantId}')" style="background: #dc2626; color: white; border-color: #b91c1c; font-weight: 800; padding: 9px 14px; border-radius: 8px; box-shadow: 0 2px 8px rgba(220,38,38,0.3);" title="यस पालिकाका सम्पूर्ण मतदाता डेटाबेसबाट हटाउनुहोस्">
                🗑️ मतदाता सूची खाली गर्नुहोस् (Purge)
              </button>
            </div>`;
  html = html.slice(0, startBtn) + replacement + html.slice(endBtn);
  console.log('✓ Added Purge button in Dossier Voters Tab CTA banner');
} else {
  console.warn('⚠️ Could not find needle2');
}

// 3. Dossier Security Tab Card
const needle3 = `<!-- Danger Zone Delete -->`;
const idx3 = html.indexOf(needle3);
if (idx3 !== -1) {
  const purgeCard = `<!-- Purge Voter Roll Only -->
              <div style="background: #fff7ed; border: 1.5px dashed #f97316; border-radius: 10px; padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <h4 style="margin: 0; color: #c2410c; font-size: 15px; font-weight: 800;">
                      🗑️ मतदाता सूची मात्र मेटाउनुहोस् (Purge Voter Roll Only)
                    </h4>
                    <p style="margin: 4px 0 0; font-size: 12.5px; color: #9a3412;">
                      यस पालिकाको खाता, लगइन युजर र सेटिङ सुरक्षित राख्दै हालसम्म अपलोड गरिएका सबै मतदाताहरू Supabase Cloud बाट स्थायी रूपमा मेटाउनुहोस्। नयाँ Excel/CSV पुन: अपलोड गर्न यो आवश्यक छ।
                    </p>
                  </div>
                  <button type="button" class="btn btn-danger" onclick="openPurgeTenantVotersModal('\${t.TenantID}')" style="background: #ea580c; border-color: #c2410c; font-weight: 800; padding: 8px 16px; border-radius: 8px;">
                    🗑️ Purge Voter Roll
                  </button>
                </div>
              </div>\n\n              `;
  html = html.slice(0, idx3) + purgeCard + html.slice(idx3);
  console.log('✓ Added Purge card in Dossier Security tab');
} else {
  console.warn('⚠️ Could not find needle3');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully saved index.html');
