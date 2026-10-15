import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bmhbuypigsfhvqxxoyoh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1J2kZOka9zrcaHkcGAD5XA_moqVXj2P';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const LOCAL_VOTERS_CACHE_KEY = 'helambu_react_voters_cache_v2';

export const INITIAL_HELAMBU_VOTERS = [
  {
    serial_no: '101',
    voter_id: '14089201',
    full_name: 'राम बहादुर तामाङ (Ram Bahadur Tamang)',
    age: 45,
    gender: 'Male',
    spouse_name: 'सीता माया तामाङ (Sita Maya Tamang)',
    father_name: 'वीर बहादुर तामाङ (Bir Bahadur Tamang)',
    mother_name: 'पेमा डोल्मा तामाङ (Pema Dolma Tamang)',
    age_group: '41-60',
    phone: '9841201001',
    ward_no: 1,
    tole: 'मेलम्चीघ्याङ',
    booth_no: 'A',
    party_leaning: 'NC',
    sentiment: 'solid',
    voted_status: true
  },
  {
    serial_no: '102',
    voter_id: '14089202',
    full_name: 'सीता माया तामाङ (Sita Maya Tamang)',
    age: 41,
    gender: 'Female',
    spouse_name: 'राम बहादुर तामाङ (Ram Bahadur Tamang)',
    father_name: 'कामी शेर्पा (Kami Sherpa)',
    mother_name: 'याङजोम शेर्पा (Yangzom Sherpa)',
    age_group: '41-60',
    phone: '9841201002',
    ward_no: 1,
    tole: 'मेलम्चीघ्याङ',
    booth_no: 'A',
    party_leaning: 'NC',
    sentiment: 'solid',
    voted_status: true
  },
  {
    serial_no: '103',
    voter_id: '14089203',
    full_name: 'पासाङ दोर्जे शेर्पा (Pasang Dorje Sherpa)',
    age: 34,
    gender: 'Male',
    spouse_name: 'मिङमा ल्हामु शेर्पा (Mingma Lhamu Sherpa)',
    father_name: 'आङ रीता शेर्पा (Ang Rita Sherpa)',
    mother_name: 'दावा डोल्मा शेर्पा (Dawa Dolma Sherpa)',
    age_group: '26-40',
    phone: '9841201003',
    ward_no: 1,
    tole: 'तार्केघ्याङ',
    booth_no: 'A',
    party_leaning: 'UML',
    sentiment: 'swing',
    voted_status: false
  },
  {
    serial_no: '104',
    voter_id: '14089204',
    full_name: 'मिङमा ल्हामु शेर्पा (Mingma Lhamu Sherpa)',
    age: 31,
    gender: 'Female',
    spouse_name: 'पासाङ दोर्जे शेर्पा (Pasang Dorje Sherpa)',
    father_name: 'निमा तेन्जिङ शेर्पा (Nima Tenzing Sherpa)',
    mother_name: 'फुर्वा ल्हामु शेर्पा (Phurba Lhamu Sherpa)',
    age_group: '26-40',
    phone: '9841201004',
    ward_no: 1,
    tole: 'तार्केघ्याङ',
    booth_no: 'A',
    party_leaning: 'UML',
    sentiment: 'swing',
    voted_status: false
  },
  {
    serial_no: '105',
    voter_id: '14089205',
    full_name: 'हरि प्रसाद भण्डारी (Hari Prasad Bhandari)',
    age: 58,
    gender: 'Male',
    spouse_name: 'राधिका देवी भण्डारी (Radhika Devi Bhandari)',
    father_name: 'टिकाराम भण्डारी (Tika Ram Bhandari)',
    mother_name: 'अम्बिका देवी भण्डारी (Ambika Devi Bhandari)',
    age_group: '41-60',
    phone: '9841201005',
    ward_no: 2,
    tole: 'किउल',
    booth_no: 'A',
    party_leaning: 'NC',
    sentiment: 'solid',
    voted_status: true
  },
  {
    serial_no: '106',
    voter_id: '14089206',
    full_name: 'राधिका देवी भण्डारी (Radhika Devi Bhandari)',
    age: 53,
    gender: 'Female',
    spouse_name: 'हरि प्रसाद भण्डारी (Hari Prasad Bhandari)',
    father_name: 'रुद्र प्रसाद अधिकारी (Rudra Prasad Adhikari)',
    mother_name: 'दुर्गा देवी अधिकारी (Durga Devi Adhikari)',
    age_group: '41-60',
    phone: '9841201006',
    ward_no: 2,
    tole: 'किउल',
    booth_no: 'A',
    party_leaning: 'NC',
    sentiment: 'solid',
    voted_status: false
  },
  {
    serial_no: '107',
    voter_id: '14089207',
    full_name: 'सुमन खड्का (Suman Khadka)',
    age: 24,
    gender: 'Male',
    spouse_name: '-',
    father_name: 'दीपक बहादुर खड्का (Dipak Bahadur Khadka)',
    mother_name: 'पार्वती खड्का (Parbati Khadka)',
    age_group: '18-25',
    phone: '9841201007',
    ward_no: 3,
    tole: 'सेर्माथाङ',
    booth_no: 'B',
    party_leaning: 'RSP',
    sentiment: 'swing',
    voted_status: false
  },
  {
    serial_no: '108',
    voter_id: '14089208',
    full_name: 'सुनिता लामा (Sunita Lama)',
    age: 29,
    gender: 'Female',
    spouse_name: 'विकास लामा (Bikash Lama)',
    father_name: 'सोम बहादुर लामा (Som Bahadur Lama)',
    mother_name: 'फूलमाया लामा (Fulmaya Lama)',
    age_group: '26-40',
    phone: '9841201008',
    ward_no: 4,
    tole: 'ग्याल्थुम',
    booth_no: 'A',
    party_leaning: 'Maoist',
    sentiment: 'favorable',
    voted_status: true
  }
];

function getLocalCachedVoters() {
  try {
    const raw = localStorage.getItem(LOCAL_VOTERS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return INITIAL_HELAMBU_VOTERS;
}

function saveLocalCachedVoters(list) {
  try {
    localStorage.setItem(LOCAL_VOTERS_CACHE_KEY, JSON.stringify(list));
  } catch (_) {}
}

// Helper to parse extended voter fields from notes JSON safely
export function enrichVoterRow(row) {
  if (!row) return row;
  let parsed = {};
  if (row.notes && typeof row.notes === 'string' && row.notes.trim().startsWith('{')) {
    try {
      parsed = JSON.parse(row.notes);
    } catch (_) {}
  }
  return {
    ...row,
    serial_no: row.serial_no || row.voter_serial || parsed.serial_no || '',
    age: row.age !== undefined && row.age !== null && row.age !== '' ? row.age : parsed.age || '',
    spouse_name: row.spouse_name || parsed.spouse_name || '',
    father_name: row.father_name || parsed.father_name || '',
    mother_name: row.mother_name || parsed.mother_name || ''
  };
}

// 1. Fetch system settings
export async function getSystemSettings() {
  const { data, error } = await supabase.from('system_settings').select('*');
  if (error) {
    console.warn('Supabase getSystemSettings error:', error);
    return [];
  }
  return data || [];
}

// 2. Fetch all users (Admins, Coordinators, Field Workers)
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase getUsers error:', error);
    return [];
  }
  return data || [];
}

// 3. Upsert a user
export async function upsertUser(user) {
  const payload = {
    user_id: user.user_id,
    name: user.name,
    phone: user.phone,
    role: user.role || 'Field Worker',
    pin: user.pin || '1234',
    ward: user.ward || 'All',
    tole: user.tole || '',
    booth_no: user.booth_no || '',
    active: user.active !== false,
    notes: user.notes || ''
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'user_id' })
    .select();

  if (error) throw error;
  return data;
}

// 4. Fetch voters (with optional filters & automatic local cache fallback)
export async function getVoters(wardNo = null) {
  try {
    let query = supabase.from('voters').select('*').order('voter_id', { ascending: true });
    if (wardNo && wardNo !== 'All') {
      query = query.eq('ward_no', Number(wardNo));
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getVoters error, using cached voters:', error);
      return getLocalCachedVoters();
    }
    if (data && data.length > 0) {
      const enriched = data.map(enrichVoterRow);
      saveLocalCachedVoters(enriched);
      return enriched;
    }
    return getLocalCachedVoters();
  } catch (err) {
    console.warn('Supabase unreachable, using local cache:', err);
    return getLocalCachedVoters();
  }
}

// 5. 1-Tap Polling Status Toggle ( भोट खस्यो ✓ / बाँकी ✕ )
export async function toggleVoterPollingStatus(voterId, isVoted) {
  const now = isVoted ? new Date().toISOString() : null;
  // Update local cache optimistically
  const cached = getLocalCachedVoters().map((v) =>
    v.voter_id === voterId ? { ...v, voted_status: isVoted, voted_time: now } : v
  );
  saveLocalCachedVoters(cached);

  try {
    const { data, error } = await supabase
      .from('voters')
      .update({
        voted_status: isVoted,
        voted_time: now,
        updated_at: new Date().toISOString()
      })
      .eq('voter_id', voterId)
      .select();

    if (error) console.warn('Supabase toggle vote warning:', error);
    return data;
  } catch (err) {
    console.warn('Offline toggle vote saved locally:', err);
    return cached;
  }
}

function buildVoterPayload(voter, includeExtendedCols = true) {
  let baseNotes = {};
  if (voter.notes && typeof voter.notes === 'string' && voter.notes.trim().startsWith('{')) {
    try {
      baseNotes = JSON.parse(voter.notes);
    } catch (_) {}
  } else if (voter.notes && typeof voter.notes === 'object') {
    baseNotes = { ...voter.notes };
  }

  const enrichedNotes = JSON.stringify({
    ...baseNotes,
    serial_no: String(voter.serial_no || ''),
    age: voter.age !== undefined && voter.age !== '' ? Number(voter.age) : '',
    spouse_name: voter.spouse_name || '',
    father_name: voter.father_name || '',
    mother_name: voter.mother_name || '',
    record_source: voter.record_source || 'CSV / Manual'
  });

  const basePayload = {
    voter_id: String(voter.voter_id),
    tenant_id: voter.tenant_id || 'TNT_HELAMBU',
    serial_no: String(voter.serial_no || ''),
    full_name: voter.full_name,
    phone: voter.phone || '',
    gender: voter.gender || '',
    age_group: voter.age_group || '',
    ward_no: Number(voter.ward_no) || 1,
    tole: voter.tole || '',
    booth_no: voter.booth_no || 'A',
    party_leaning: voter.party_leaning || 'Undecided',
    sentiment: voter.sentiment || 'swing',
    address: voter.address || '',
    notes: enrichedNotes,
    voted_status: !!voter.voted_status,
    voted_time: voter.voted_time || null,
    voter_roll_version: voter.voter_roll_version || '2081_Baisakh',
    import_batch_id: voter.import_batch_id || null
  };

  if (includeExtendedCols) {
    basePayload.age = voter.age !== undefined && voter.age !== '' ? Number(voter.age) : null;
    basePayload.spouse_name = voter.spouse_name || '';
    basePayload.father_name = voter.father_name || '';
    basePayload.mother_name = voter.mother_name || '';
  }

  return basePayload;
}

// 6. Upsert single voter details
export async function upsertVoter(voter) {
  // Update local cache immediately
  const cur = getLocalCachedVoters();
  const idx = cur.findIndex((x) => String(x.voter_id) === String(voter.voter_id));
  const merged = enrichVoterRow({ ...(idx >= 0 ? cur[idx] : {}), ...voter });
  if (idx >= 0) cur[idx] = merged;
  else cur.unshift(merged);
  saveLocalCachedVoters(cur);

  try {
    const fullPayload = buildVoterPayload(voter, true);
    const { data, error } = await supabase
      .from('voters')
      .upsert(fullPayload, { onConflict: 'voter_id' })
      .select();

    if (error) {
      // Fallback if extended columns not yet present
      const compatPayload = buildVoterPayload(voter, false);
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from('voters')
        .upsert(compatPayload, { onConflict: 'voter_id' })
        .select();
      if (fallbackErr) console.warn('Supabase compat upsert warning:', fallbackErr);
      return (fallbackData || [merged]).map(enrichVoterRow);
    }
    return (data || [merged]).map(enrichVoterRow);
  } catch (err) {
    console.warn('Saved voter to local cache (Supabase offline):', err);
    return [merged];
  }
}

// 7. Bulk Upsert Voters from CSV Import (SUPER ADMIN ONLY - Batched + Batch ID Tracking)
export async function bulkUpsertVoters(voterArray, options = {}) {
  if (!Array.isArray(voterArray) || voterArray.length === 0) return [];

  const tenantId = options.tenantId || 'TNT_HELAMBU';
  const batchId = options.batchId || `BATCH_${Date.now()}`;
  const rollVersion = options.rollVersion || '2081_Baisakh';

  // Merge into local cache immediately
  const cur = getLocalCachedVoters();
  const map = new Map(cur.map((v) => [String(v.voter_id).toLowerCase(), v]));
  voterArray.forEach((v) => {
    const key = String(v.voter_id).toLowerCase();
    const existing = map.get(key) || {};
    map.set(key, enrichVoterRow({
      ...existing,
      ...v,
      tenant_id: tenantId,
      import_batch_id: batchId,
      voter_roll_version: rollVersion
    }));
  });
  const updatedList = Array.from(map.values());
  saveLocalCachedVoters(updatedList);

  // Push to Supabase in batches of 100
  const BATCH_SIZE = 100;
  const results = [];
  for (let i = 0; i < voterArray.length; i += BATCH_SIZE) {
    const chunk = voterArray.slice(i, i + BATCH_SIZE);
    try {
      const fullPayloads = chunk.map((v) => buildVoterPayload({
        ...v,
        tenant_id: tenantId,
        import_batch_id: batchId,
        voter_roll_version: rollVersion
      }, true));

      const { data, error } = await supabase
        .from('voters')
        .upsert(fullPayloads, { onConflict: 'voter_id' })
        .select();

      if (error) {
        const compatPayloads = chunk.map((v) => buildVoterPayload({
          ...v,
          tenant_id: tenantId,
          import_batch_id: batchId,
          voter_roll_version: rollVersion
        }, false));
        const { data: fallbackData } = await supabase
          .from('voters')
          .upsert(compatPayloads, { onConflict: 'voter_id' })
          .select();
        if (fallbackData) results.push(...fallbackData.map(enrichVoterRow));
      } else if (data) {
        results.push(...data.map(enrichVoterRow));
      }
    } catch (err) {
      console.warn('Batch Supabase sync warning (cached locally):', err);
    }
  }

  // Record batch metadata in local storage and Supabase
  try {
    await recordImportBatch({
      batch_id: batchId,
      tenant_id: tenantId,
      file_name: options.fileName || 'bulk_import.csv',
      import_type: options.importType || 'single_centre',
      total_rows: voterArray.length,
      success_count: results.length || voterArray.length,
      voter_roll_version: rollVersion,
      status: 'Completed',
      imported_by: options.importedBy || 'Super Admin'
    });
  } catch (bErr) {
    console.warn('Could not save batch log:', bErr);
  }

  return results.length > 0 ? results : updatedList;
}

// 8. TENANTS CRUD (Super Admin Central Hub)
export async function getTenants() {
  try {
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('Using local tenants fallback:', err);
  }
  const local = localStorage.getItem('saas_tenants_registry');
  return local ? JSON.parse(local) : [
    {
      tenant_id: 'TNT_HELAMBU',
      name: 'Helambu Rural Municipality Election HQ',
      slug: 'helambu',
      province: 'Bagmati',
      district: 'Sindhupalchok',
      palika: 'Helambu Rural Municipality',
      admin_name: 'Helambu Admin',
      admin_phone: '9841201000',
      account_status: 'Active',
      subscription_status: 'Current',
      sms_balance: 10000
    }
  ];
}

// 9. IMPORT BATCHES & ROLLBACK (Super Admin Safe Operations)
export async function recordImportBatch(batchData) {
  try {
    await supabase.from('import_batches').upsert(batchData);
  } catch (_) {}
  const local = JSON.parse(localStorage.getItem('voter_import_batches') || '[]');
  local.unshift({ ...batchData, created_at: new Date().toISOString() });
  localStorage.setItem('voter_import_batches', JSON.stringify(local.slice(0, 50)));
}

export async function getImportBatches(tenantId) {
  try {
    let q = supabase.from('import_batches').select('*').order('created_at', { ascending: false });
    if (tenantId) q = q.eq('tenant_id', tenantId);
    const { data, error } = await q;
    if (!error && data) return data;
  } catch (_) {}
  const local = JSON.parse(localStorage.getItem('voter_import_batches') || '[]');
  return tenantId ? local.filter(b => b.tenant_id === tenantId) : local;
}

export async function rollbackImportBatch(batchId, tenantId) {
  // 1. Remove from local cache
  const cached = getLocalCachedVoters().filter(v => v.import_batch_id !== batchId);
  saveLocalCachedVoters(cached);

  // 2. Remove from Supabase
  try {
    let q = supabase.from('voters').delete().eq('import_batch_id', batchId);
    if (tenantId) q = q.eq('tenant_id', tenantId);
    await q;
    await supabase.from('import_batches').update({ status: 'Reverted' }).eq('batch_id', batchId);
  } catch (err) {
    console.warn('Rollback supabase failed:', err);
  }

  // 3. Mark batch status reverted locally
  const local = JSON.parse(localStorage.getItem('voter_import_batches') || '[]');
  const updated = local.map(b => b.batch_id === batchId ? { ...b, status: 'Reverted' } : b);
  localStorage.setItem('voter_import_batches', JSON.stringify(updated));
  return cached;
}
