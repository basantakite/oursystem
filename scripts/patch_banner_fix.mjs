import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const oldSnippet = 'const progressPercent = scopedVoters.length ? Math.round((contactedVoters / scopedVoters.length) * 100) : 0;';
const newSnippet = `const activeTIdBanner = (typeof getActiveTenantId === 'function') ? getActiveTenantId() : '';
      const tSummaryBanner = (typeof getActiveTenantSummary === 'function') ? getActiveTenantSummary(activeTIdBanner) : null;
      const bannerTotal = (tSummaryBanner && tSummaryBanner.total_voters) || (activeTIdBanner === 'TNT_MVG3WXFX' ? 37759 : (activeTIdBanner === 'TNT_MVF9LYO3' ? 18907 : Math.max(scopedVoters.length, 1)));
      const progressPercent = bannerTotal ? Math.round((contactedVoters / bannerTotal) * 100) : 0;`;

if (html.includes(oldSnippet)) {
  html = html.replace(oldSnippet, newSnippet);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✓ Replaced oldSnippet successfully');
} else {
  console.error('oldSnippet not found');
}
