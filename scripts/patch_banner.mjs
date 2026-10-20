import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const bannerOld = `      const scopedVoters = getScopedVoters();
      const contactedVoters = scopedVoters.filter(v => v.ContactStatus === 'Contacted').length;
      const progressPercent = scopedVoters.length ? Math.round((contactedVoters / scopedVoters.length) * 100) : 0;`;

const bannerNew = `      const scopedVoters = getScopedVoters();
      const contactedVoters = scopedVoters.filter(v => v.ContactStatus === 'Contacted').length;
      const activeTIdBanner = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : '';
      const tSummaryBanner = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(activeTIdBanner) : null;
      const bannerTotal = (tSummaryBanner && tSummaryBanner.total_voters) || (activeTIdBanner === 'TNT_MVG3WXFX' ? 37759 : (activeTIdBanner === 'TNT_MVF9LYO3' ? 18907 : Math.max(scopedVoters.length, 1)));
      const progressPercent = bannerTotal ? Math.round((contactedVoters / bannerTotal) * 100) : 0;`;

if (html.includes(bannerOld)) {
  html = html.replace(bannerOld, bannerNew);
  console.log('✓ Updated banner progress computation');
}

const bannerTextOld = `<span>🎯 सम्पर्क प्रगति: <b>\${contactedVoters.toLocaleString()} / \${scopedVoters.length.toLocaleString()}</b> (\${progressPercent}%)</span>`;
const bannerTextNew = `<span>🎯 सम्पर्क प्रगति: <b>\${contactedVoters.toLocaleString()} / \${bannerTotal.toLocaleString()}</b> (\${progressPercent}%)</span>`;

if (html.includes(bannerTextOld)) {
  html = html.replace(bannerTextOld, bannerTextNew);
  console.log('✓ Updated banner text to show bannerTotal');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Banner patched successfully');
