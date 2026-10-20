import fs from 'fs';

console.log('--- Bumping build to v44-caste-hub-complete ---');

const newVersion = '20261020-v44-caste-hub-complete';
const newCache = 'election-ops-v44-caste-hub-complete';

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/const CURRENT_APP_BUILD = ['"][^'"]+['"];/, `const CURRENT_APP_BUILD = '${newVersion}';`);
html = html.replace(/CURRENT_APP_BUILD = ['"][^'"]+['"];/, `CURRENT_APP_BUILD = '${newVersion}';`);
fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Updated index.html build version');

// 2. Update sw.js
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = '${newCache}';`);
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ Updated sw.js CACHE_NAME');
