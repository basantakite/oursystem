import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const oldSpouseCode = `        // Rule 4: Spouse (Opposite gender + Age difference <= 25)
        const sCand = pool.find(c => {
          const cId = c.voter_id || c.VoterID;
          if (seen.has(cId)) return false;`;

const newSpouseCode = `        // Parse ignored_family_ids from notes
        let ignoredIds = new Set();
        try {
          const n = JSON.parse(head.notes || '{}');
          if (Array.isArray(n.ignored_family_ids)) n.ignored_family_ids.forEach(id => ignoredIds.add(String(id)));
        } catch(e) {}

        // Rule 4: Spouse (Opposite gender + realistic age gap)
        const sCand = pool.find(c => {
          const cId = String(c.voter_id || c.VoterID);
          if (seen.has(cId) || ignoredIds.has(cId)) return false;`;

if (html.includes(oldSpouseCode)) {
  html = html.replace(oldSpouseCode, newSpouseCode);
  console.log('✓ Replaced oldSpouseCode');
} else {
  console.warn('⚠️ Could not find oldSpouseCode');
}

const oldAgeGap = `if (hAge > 0 && cAge > 0 && Math.abs(cAge - hAge) > 25) return false;`;
const newAgeGap = `if (hAge > 0 && cAge > 0) {
            if (Math.abs(cAge - hAge) > 20) return false;
            if ((hGender === 'Male' || hGender === 'पुरुष') && (cAge - hAge) > 8) return false;
          }`;

if (html.includes(oldAgeGap)) {
  html = html.replace(oldAgeGap, newAgeGap);
  console.log('✓ Replaced oldAgeGap');
} else {
  console.warn('⚠️ Could not find oldAgeGap');
}

if (isCrlf) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote index.html');
