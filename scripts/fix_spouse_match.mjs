import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const target = `          if (cleanS && cleanStr(c.full_name || c.Name).includes(cleanStr(cleanS))) return true;
          const cSp = c.spouse_name || c.SpouseName;
          if (cSp && cleanStr(cSp).includes(cleanStr(cleanFirst))) return true;
          return false;`;

const replacement = `          if (cleanS && cleanStr(c.full_name || c.Name).includes(cleanStr(cleanS))) return true;
          const cSp = c.spouse_name || c.SpouseName;
          if (cSp) {
            const cSpClean = cleanStr(cSp);
            const hNameClean = cleanStr(hName);
            if (cSpClean === hNameClean) return true;
            if (hSur && cSpClean.includes(cleanStr(cleanFirst)) && cSpClean.includes(cleanStr(hSur))) return true;
          }
          return false;`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  console.log('✓ Found and replaced spouse matching logic');
} else {
  console.warn('⚠️ Target not found');
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}
fs.writeFileSync('index.html', html, 'utf8');
