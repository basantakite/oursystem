import fs from 'fs';

console.log('--- Fixing cleanFirst variable name in viewHouseholdFamilyModal ---');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// Replace const hFirst with const cleanFirst
html = html.replace(
  "const hFirst = cleanQueryTerm(hName.split(' ')[0]);",
  "const cleanFirst = cleanQueryTerm(hName.split(' ')[0]);"
);

// Replace remaining hFirst references with cleanFirst
html = html.replace(/cleanStr\(hFirst\)/g, "cleanStr(cleanFirst)");

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully fixed cleanFirst in index.html');
