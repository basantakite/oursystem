import fs from 'fs';
import readline from 'readline';

const SUPABASE_URL = 'https://peakeevonxocosrlypyx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_I-Qsd3Ior53hZM8m0dMDnQ_GabbK47N';
const TARGET_TENANT = 'TNT_MVG3WXFX';
const CSV_FILE = 'C:\\Users\\Global Era\\Downloads\\Gokarneshwor_Master_ENGLISH_10_Columns.csv';

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function run() {
  console.log(`Starting voter import for ${TARGET_TENANT} from ${CSV_FILE}...`);
  if (!fs.existsSync(CSV_FILE)) {
    console.error('File does not exist:', CSV_FILE);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  let header = null;
  const allRows = [];
  for await (const rawLine of rl) {
    const line = rawLine.replace(/^\uFEFF/, '').trim();
    if (!line) continue;
    const parts = parseCsvLine(line);
    if (!header) {
      header = parts;
      console.log('Detected Header:', header);
      continue;
    }

    const [sn, vId, name, age, gender, spouse, father, mother, ward, booth] = parts;
    if (!vId || !name) continue;

    const cleanSpouse = (!spouse || spouse === '-') ? '' : spouse;
    const cleanFather = (!father || father === '-') ? '' : father;
    const cleanMother = (!mother || mother === '-') ? '' : mother;
    const voterIdStr = String(vId).trim();

    allRows.push({
      tenant_id: TARGET_TENANT,
      voter_id: voterIdStr,
      official_voter_id: voterIdStr,
      full_name: name.trim(),
      serial_no: String(sn || '').trim(),
      age: Number(age) || null,
      gender: gender || 'Other',
      spouse_name: cleanSpouse,
      father_name: cleanFather,
      mother_name: cleanMother,
      ward_no: Number(ward) || 1,
      booth_no: booth ? booth.trim() : '',
      phone: '',
      tole: '',
      party_leaning: 'Undecided',
      sentiment: 'swing',
      support_level: 'Neutral',
      influence_level: 'Normal',
      is_influencer: false,
      address: '',
      facebook_url: '',
      tiktok_url: '',
      voted_status: false,
      voted_time: null,
      tags: [],
      notes: JSON.stringify({
        tenant_id: TARGET_TENANT,
        verification_status: 'Verified',
        contact_status: 'Not Contacted',
        self_reported_response: '',
        support_tier: 'swing',
        is_influencer: false,
        current_location: 'गाउँमै उपस्थित (On-Ground)',
        election_day_turnout: 'पक्का स्थानीय उपस्थित (Confirmed)',
        city_address: '',
        household_id: '',
        family_relation: 'घरमुली',
        family_votes_count: 1,
        house_no: '',
        age: Number(age) || '',
        spouse_name: cleanSpouse,
        father_name: cleanFather,
        mother_name: cleanMother,
        official_voter_id: voterIdStr,
        gender: gender || 'Other',
        record_source: 'Super Admin Bulk Import',
        polling_location: booth ? booth.trim() : ''
      }),
      updated_at: new Date().toISOString()
    });
  }

  console.log(`Parsed total ${allRows.length} valid voter rows.`);

  // Upload in parallel batches of 500 with 4 workers
  const BATCH_SIZE = 500;
  const CONCURRENCY = 4;
  let totalUploaded = 0;
  const startTime = Date.now();

  for (let i = 0; i < allRows.length; i += BATCH_SIZE * CONCURRENCY) {
    const batchGroup = [];
    for (let c = 0; c < CONCURRENCY; c++) {
      const start = i + c * BATCH_SIZE;
      if (start < allRows.length) {
        const chunk = allRows.slice(start, start + BATCH_SIZE);
        batchGroup.push(chunk);
      }
    }

    await Promise.all(
      batchGroup.map(async (chunk) => {
        let attempt = 0;
        let success = false;
        while (attempt < 3 && !success) {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/voters`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify(chunk)
            });
            if (res.ok) {
              totalUploaded += chunk.length;
              success = true;
            } else {
              const err = await res.text();
              console.warn(`Batch failed (status ${res.status}): ${err.slice(0, 150)}`);
              attempt++;
              await new Promise(r => setTimeout(r, 1000 * attempt));
            }
          } catch (e) {
            console.warn(`Batch error: ${e.message}`);
            attempt++;
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
        }
      })
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const pct = Math.round((totalUploaded / allRows.length) * 100);
    console.log(`Progress: ${totalUploaded} / ${allRows.length} (${pct}%) in ${elapsed}s`);
  }

  console.log(`\n🎉 COMPLETED! Successfully uploaded ${totalUploaded} voters for tenant ${TARGET_TENANT} in ${((Date.now() - startTime)/1000).toFixed(1)}s.`);
}

run().catch(console.error);
