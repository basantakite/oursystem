import fs from 'fs';

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = '.*?';/, "const CACHE_NAME = 'election-ops-v40-household-family-sync';");
fs.writeFileSync('sw.js', sw, 'utf8');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/const CURRENT_APP_BUILD = '.*?';/, "const CURRENT_APP_BUILD = '20261020-v40-household-family-sync';");
html = html.replace(/navigator\.serviceWorker\.register\('sw\.js\?v=.*?'\)/, "navigator.serviceWorker.register('sw.js?v=20261020-v40-household-family-sync')");
fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Bumped sw.js and index.html build to v40-household-family-sync');
