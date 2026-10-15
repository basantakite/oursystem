import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { bulkUpsertVoters } from '../supabaseClient';

export const SAMPLE_VOTERS_EN = [
  {
    serial_no: '101',
    voter_id: '14089201',
    full_name: 'Ram Bahadur Tamang',
    age: '45',
    gender: 'Male',
    spouse_name: 'Sita Maya Tamang',
    father_name: 'Bir Bahadur Tamang',
    mother_name: 'Pema Dolma Tamang',
    ward_no: 1,
    tole: 'Melamchighyang',
    booth_no: 'A',
    phone: '9841201001'
  },
  {
    serial_no: '102',
    voter_id: '14089202',
    full_name: 'Sita Maya Tamang',
    age: '41',
    gender: 'Female',
    spouse_name: 'Ram Bahadur Tamang',
    father_name: 'Kami Sherpa',
    mother_name: 'Yangzom Sherpa',
    ward_no: 1,
    tole: 'Melamchighyang',
    booth_no: 'A',
    phone: '9841201002'
  },
  {
    serial_no: '103',
    voter_id: '14089203',
    full_name: 'Pasang Dorje Sherpa',
    age: '34',
    gender: 'Male',
    spouse_name: 'Mingma Lhamu Sherpa',
    father_name: 'Ang Rita Sherpa',
    mother_name: 'Dawa Dolma Sherpa',
    ward_no: 1,
    tole: 'Tarkeghyang',
    booth_no: 'A',
    phone: '9841201003'
  },
  {
    serial_no: '104',
    voter_id: '14089204',
    full_name: 'Mingma Lhamu Sherpa',
    age: '31',
    gender: 'Female',
    spouse_name: 'Pasang Dorje Sherpa',
    father_name: 'Nima Tenzing Sherpa',
    mother_name: 'Phurba Lhamu Sherpa',
    ward_no: 1,
    tole: 'Tarkeghyang',
    booth_no: 'A',
    phone: '9841201004'
  },
  {
    serial_no: '105',
    voter_id: '14089205',
    full_name: 'Hari Prasad Bhandari',
    age: '58',
    gender: 'Male',
    spouse_name: 'Radhika Devi Bhandari',
    father_name: 'Tika Ram Bhandari',
    mother_name: 'Ambika Devi Bhandari',
    ward_no: 2,
    tole: 'Kiul',
    booth_no: 'A',
    phone: '9841201005'
  },
  {
    serial_no: '106',
    voter_id: '14089206',
    full_name: 'Radhika Devi Bhandari',
    age: '53',
    gender: 'Female',
    spouse_name: 'Hari Prasad Bhandari',
    father_name: 'Rudra Prasad Adhikari',
    mother_name: 'Durga Devi Adhikari',
    ward_no: 2,
    tole: 'Kiul',
    booth_no: 'A',
    phone: '9841201006'
  },
  {
    serial_no: '107',
    voter_id: '14089207',
    full_name: 'Suman Khadka',
    age: '24',
    gender: 'Male',
    spouse_name: '-',
    father_name: 'Dipak Bahadur Khadka',
    mother_name: 'Parbati Khadka',
    ward_no: 3,
    tole: 'Sermathang',
    booth_no: 'B',
    phone: '9841201007'
  },
  {
    serial_no: '108',
    voter_id: '14089208',
    full_name: 'Sunita Lama',
    age: '29',
    gender: 'Female',
    spouse_name: 'Bikash Lama',
    father_name: 'Som Bahadur Lama',
    mother_name: 'Fulmaya Lama',
    ward_no: 4,
    tole: 'Gyalthum',
    booth_no: 'A',
    phone: '9841201008'
  }
];

export const SAMPLE_VOTERS_NE = [
  {
    serial_no: '१०१',
    voter_id: '14089201',
    full_name: 'राम बहादुर तामाङ',
    age: '45',
    gender: 'पुरुष',
    spouse_name: 'सीता माया तामाङ',
    father_name: 'वीर बहादुर तामाङ',
    mother_name: 'पेमा डोल्मा तामाङ',
    ward_no: 1,
    tole: 'मेलम्चीघ्याङ',
    booth_no: 'A',
    phone: '9841201001'
  },
  {
    serial_no: '१०२',
    voter_id: '14089202',
    full_name: 'सीता माया तामाङ',
    age: '41',
    gender: 'महिला',
    spouse_name: 'राम बहादुर तामाङ',
    father_name: 'कामी शेर्पा',
    mother_name: 'याङजोम शेर्पा',
    ward_no: 1,
    tole: 'मेलम्चीघ्याङ',
    booth_no: 'A',
    phone: '9841201002'
  },
  {
    serial_no: '१०३',
    voter_id: '14089203',
    full_name: 'पासाङ दोर्जे शेर्पा',
    age: '34',
    gender: 'पुरुष',
    spouse_name: 'मिङमा ल्हामु शेर्पा',
    father_name: 'आङ रीता शेर्पा',
    mother_name: 'दावा डोल्मा शेर्पा',
    ward_no: 1,
    tole: 'तार्केघ्याङ',
    booth_no: 'A',
    phone: '9841201003'
  },
  {
    serial_no: '१०४',
    voter_id: '14089204',
    full_name: 'मिङमा ल्हामु शेर्पा',
    age: '31',
    gender: 'महिला',
    spouse_name: 'पासाङ दोर्जे शेर्पा',
    father_name: 'निमा तेन्जिङ शेर्पा',
    mother_name: 'फुर्वा ल्हामु शेर्पा',
    ward_no: 1,
    tole: 'तार्केघ्याङ',
    booth_no: 'A',
    phone: '9841201004'
  },
  {
    serial_no: '१०५',
    voter_id: '14089205',
    full_name: 'हरि प्रसाद भण्डारी',
    age: '58',
    gender: 'पुरुष',
    spouse_name: 'राधिका देवी भण्डारी',
    father_name: 'टिकाराम भण्डारी',
    mother_name: 'अम्बिका देवी भण्डारी',
    ward_no: 2,
    tole: 'किउल',
    booth_no: 'A',
    phone: '9841201005'
  }
];

function convertNepaliDigits(str) {
  if (!str) return '';
  const map = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
  return String(str).replace(/[०-९]/g, (d) => map[d] || d);
}

function normalizeGender(val) {
  const s = String(val || '').trim();
  const low = s.toLowerCase();
  if (low === 'male' || low === 'm' || s === 'पुरुष' || s === 'पु' || s === 'पुरूष') return 'Male';
  if (low === 'female' || low === 'f' || s === 'महिला' || s === 'म') return 'Female';
  if (!s || s === '-') return '';
  return 'Other';
}

function computeAgeGroup(ageVal) {
  const n = Number(ageVal);
  if (!isNaN(n) && n >= 18) {
    if (n <= 25) return '18-25';
    if (n <= 40) return '26-40';
    if (n <= 60) return '41-60';
    return '60+';
  }
  return '';
}

function parseCsvLineSmart(line, delimiter = ',') {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result.map((c) => c.replace(/^"|"$/g, '').trim());
}

export function parseVoterCsvText(rawText, existingVoters = [], defaults = {}) {
  const cleaned = String(rawText || '').replace(/^\uFEFF/, '').trim();
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], colStatus: {}, error: 'CSV मा कम्तीमा १ हेडर र १ मतदाता पङ्क्ति हुनुपर्छ।' };
  }

  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';

  const rawHeaders = parseCsvLineSmart(lines[0], delimiter);
  const normHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, ''));

  const findIdx = (candidates) => {
    for (const c of candidates) {
      const idx = normHeaders.indexOf(c);
      if (idx >= 0) return idx;
    }
    for (const c of candidates) {
      const idx = normHeaders.findIndex((h) => h.includes(c));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const mapIdx = {
    sn: findIdx(['sn', 's.n.', 'serial', 'voterserial', 'serialno', 'क्रसं', 'क्रमसंख्या']),
    voterId: findIdx(['voterid', 'id', 'officialvoterid', 'मतदातानं', 'परिचयपत्रनं']),
    fullName: findIdx(['fullname', 'name', 'votername', 'पूरानाम', 'मतदाताकोनाम', 'नाम']),
    age: findIdx(['age', 'उमेर', 'वर्ष']),
    gender: findIdx(['gender', 'sex', 'लिङ्ग', 'लिंग']),
    spouseName: findIdx(['spousename', 'spouse', 'husbandwife', 'पतिपत्नीकोनाम', 'पतिपत्नी']),
    fatherName: findIdx(['fathername', 'father', 'fathersname', 'बुबाकोनाम', 'पिताकोनाम', 'बाबुकोनाम']),
    motherName: findIdx(['mothername', 'mother', 'mothersname', 'आमाकोनाम', 'माताकोनाम']),
    ward: findIdx(['ward', 'wardno', 'वडा', 'वडानं']),
    tole: findIdx(['tole', 'village', 'address', 'टोल', 'गाउँ']),
    booth: findIdx(['booth', 'boothno', 'बुथ']),
    phone: findIdx(['phone', 'mobile', 'फोन', 'मोबाइल']),
    party: findIdx(['partyleaning', 'party', 'पार्टी'])
  };

  if (mapIdx.fullName < 0 && rawHeaders.length >= 6) {
    if (mapIdx.sn < 0) mapIdx.sn = 0;
    if (mapIdx.voterId < 0) mapIdx.voterId = 1;
    mapIdx.fullName = 2;
    if (mapIdx.age < 0) mapIdx.age = 3;
    if (mapIdx.gender < 0) mapIdx.gender = 4;
    if (mapIdx.spouseName < 0) mapIdx.spouseName = 5;
    if (mapIdx.fatherName < 0 && rawHeaders.length >= 7) mapIdx.fatherName = 6;
    if (mapIdx.motherName < 0 && rawHeaders.length >= 8) mapIdx.motherName = 7;
  }

  const colStatus = {
    'S.N.': mapIdx.sn >= 0,
    'Voter ID': mapIdx.voterId >= 0,
    'Full Name': mapIdx.fullName >= 0,
    Age: mapIdx.age >= 0,
    Gender: mapIdx.gender >= 0,
    'Spouse Name': mapIdx.spouseName >= 0,
    'Father Name': mapIdx.fatherName >= 0,
    'Mother Name': mapIdx.motherName >= 0
  };

  const existingIdSet = new Set(existingVoters.map((v) => String(v.voter_id || '').trim().toLowerCase()).filter(Boolean));
  const defWard = Number(defaults.ward_no || 1);
  const defBooth = defaults.booth_no || 'A';
  const defTole = defaults.tole || '';

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLineSmart(lines[i], delimiter);
    if (cols.every((c) => !c)) continue;
    const getVal = (idx) => (idx >= 0 && cols[idx] !== undefined ? cols[idx].trim() : '');

    const snVal = convertNepaliDigits(getVal(mapIdx.sn)) || String(i);
    const voterIdVal = convertNepaliDigits(getVal(mapIdx.voterId)) || `VOT_${Date.now()}_${i}`;
    const fullNameVal = getVal(mapIdx.fullName);
    const ageAscii = convertNepaliDigits(getVal(mapIdx.age));
    const ageNum = ageAscii && !isNaN(Number(ageAscii)) ? Number(ageAscii) : '';
    const genderRaw = getVal(mapIdx.gender);
    const genderNorm = normalizeGender(genderRaw) || genderRaw || '';
    const spouseVal = getVal(mapIdx.spouseName) || '-';
    const fatherVal = getVal(mapIdx.fatherName) || '-';
    const motherVal = getVal(mapIdx.motherName) || '-';

    const wardAscii = convertNepaliDigits(getVal(mapIdx.ward));
    const wardVal = wardAscii && !isNaN(Number(wardAscii)) ? Number(wardAscii) : defWard;
    const toleVal = getVal(mapIdx.tole) || defTole;
    const boothVal = getVal(mapIdx.booth) || defBooth;
    const phoneVal = convertNepaliDigits(getVal(mapIdx.phone));
    const partyVal = getVal(mapIdx.party) || 'Undecided';

    const isValid = Boolean(fullNameVal && fullNameVal.length >= 2);
    const isDuplicate = existingIdSet.has(voterIdVal.toLowerCase());

    rows.push({
      rowIndex: i,
      selected: isValid,
      isValid,
      isDuplicate,
      serial_no: snVal,
      voter_id: voterIdVal,
      full_name: fullNameVal,
      age: ageNum,
      age_group: computeAgeGroup(ageNum),
      gender: genderNorm,
      spouse_name: spouseVal,
      father_name: fatherVal,
      mother_name: motherVal,
      ward_no: wardVal,
      tole: toleVal,
      booth_no: boothVal,
      phone: phoneVal,
      party_leaning: partyVal
    });
  }

  return { rows, colStatus, error: null };
}

export default function VoterBulkImportModal({
  open,
  onClose,
  existingVoters = [],
  onImportSuccess,
  initialTab = 0
}) {
  const [tabIndex, setTabIndex] = useState(initialTab);
  const [sampleLang, setSampleLang] = useState('en');
  const [defaultWard, setDefaultWard] = useState(1);
  const [defaultBooth, setDefaultBooth] = useState('A');
  const [defaultTole, setDefaultTole] = useState('');
  const [duplicateMode, setDuplicateMode] = useState('update'); // 'update' or 'skip'
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [colStatus, setColStatus] = useState({
    'S.N.': true,
    'Voter ID': true,
    'Full Name': true,
    Age: true,
    Gender: true,
    'Spouse Name': true,
    'Father Name': true,
    'Mother Name': true
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [importing, setImporting] = useState(false);

  React.useEffect(() => {
    if (open) {
      setTabIndex(initialTab);
      if (parsedRows.length === 0) {
        loadSampleIntoPreview('en');
      }
    }
  }, [open, initialTab]);

  const loadSampleIntoPreview = (lang = sampleLang) => {
    const src = lang === 'ne' ? SAMPLE_VOTERS_NE : SAMPLE_VOTERS_EN;
    const headers = ['S.N.', 'Voter ID', 'Full Name', 'Age', 'Gender', 'Spouse Name', 'Father Name', 'Mother Name', 'Ward', 'Tole', 'BoothNo', 'Phone'];
    const csvStr = [
      headers.join(','),
      ...src.map((r) =>
        [r.serial_no, r.voter_id, r.full_name, r.age, r.gender, r.spouse_name, r.father_name, r.mother_name, r.ward_no, r.tole, r.booth_no, r.phone]
          .map((v) => `"${v}"`)
          .join(',')
      )
    ].join('\n');
    setPasteText(csvStr);
    setFileName('sample_voter_list.csv (Sample Loaded)');
    const res = parseVoterCsvText(csvStr, existingVoters, {
      ward_no: defaultWard,
      booth_no: defaultBooth,
      tole: defaultTole
    });
    setParsedRows(res.rows);
    setColStatus(res.colStatus);
    setErrorMsg('');
  };

  const handleDownloadSampleCsv = (lang = 'en') => {
    const src = lang === 'ne' ? SAMPLE_VOTERS_NE : SAMPLE_VOTERS_EN;
    const headers = ['S.N.', 'Voter ID', 'Full Name', 'Age', 'Gender', 'Spouse Name', 'Father Name', 'Mother Name', 'Ward', 'Tole', 'BoothNo', 'Phone'];
    const csvLines = [
      headers.map((h) => `"${h}"`).join(','),
      ...src.map((r) =>
        [r.serial_no, r.voter_id, r.full_name, r.age, r.gender, r.spouse_name, r.father_name, r.mother_name, r.ward_no, r.tole, r.booth_no, r.phone]
          .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvLines], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = lang === 'ne' ? 'voter_import_template_nepali.csv' : 'voter_import_template.csv';
    link.click();
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const res = parseVoterCsvText(text, existingVoters, {
        ward_no: defaultWard,
        booth_no: defaultBooth,
        tole: defaultTole
      });
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setErrorMsg('');
        setParsedRows(res.rows);
        setColStatus(res.colStatus);
        setTabIndex(0);
      }
    };
    reader.readAsText(file);
  };

  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      setErrorMsg('कृपया पहिले CSV वा Excel डाटा पेस्ट गर्नुहोस्।');
      return;
    }
    const res = parseVoterCsvText(pasteText, existingVoters, {
      ward_no: defaultWard,
      booth_no: defaultBooth,
      tole: defaultTole
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setErrorMsg('');
      setParsedRows(res.rows);
      setColStatus(res.colStatus);
    }
  };

  const toggleRowSelection = (idx) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === idx && r.isValid ? { ...r, selected: !r.selected } : r))
    );
  };

  const toggleAllRows = (checked) => {
    setParsedRows((prev) => prev.map((r) => (r.isValid ? { ...r, selected: checked } : r)));
  };

  const selectedValidRows = useMemo(
    () =>
      parsedRows.filter((r) => {
        if (!r.selected || !r.isValid) return false;
        if (duplicateMode === 'skip' && r.isDuplicate) return false;
        return true;
      }),
    [parsedRows, duplicateMode]
  );

  const handleExecuteImport = async () => {
    if (selectedValidRows.length === 0) return;
    try {
      setImporting(true);
      setErrorMsg('');
      await bulkUpsertVoters(selectedValidRows);
      if (onImportSuccess) onImportSuccess(selectedValidRows.length);
      onClose();
    } catch (err) {
      setErrorMsg('Supabase अपलोडमा समस्या आयो: ' + (err.message || String(err)));
    } finally {
      setImporting(false);
    }
  };

  const activeSampleRows = sampleLang === 'ne' ? SAMPLE_VOTERS_NE : SAMPLE_VOTERS_EN;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          bgcolor: '#1e3a6e',
          color: '#ffffff',
          fontWeight: 800,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadFileIcon />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.08rem' }}>
            Bulk Upload Voter List & Sample Preview (Supabase Cloud CSV Importer)
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Top Action & Tab Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
            borderBottom: '1px solid #e2e8f0',
            pb: 1
          }}
        >
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ minHeight: 38 }}>
            <Tab
              icon={<UploadFileIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="१. Bulk CSV Upload & Live Preview"
              sx={{ fontWeight: 800, minHeight: 38, textTransform: 'none' }}
            />
            <Tab
              icon={<VisibilityIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="२. Official Sample Format Preview (नमूना ढाँचा)"
              sx={{ fontWeight: 800, minHeight: 38, textTransform: 'none' }}
            />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadSampleCsv('en')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Sample CSV (EN)
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadSampleCsv('ne')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              नमूना CSV (नेपाली)
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                loadSampleIntoPreview(sampleLang);
                setTabIndex(0);
              }}
              sx={{ bgcolor: '#059669', fontWeight: 800, borderRadius: 2 }}
            >
              Load Sample Data
            </Button>
          </Box>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {importing && <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />}

        {tabIndex === 0 ? (
          <Box>
            {/* Top 3-Column Upload + Paste + Batch Defaults */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Box
                  component="label"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #3b82f6',
                    borderRadius: 3,
                    p: 2,
                    height: '100%',
                    bgcolor: '#eff6ff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    '&:hover': { bgcolor: '#dbeafe', borderColor: '#1e3a6e' }
                  }}
                >
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    hidden
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                  <UploadFileIcon sx={{ fontSize: 32, color: '#1e3a6e', mb: 0.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e3a6e' }}>
                    Choose Voter CSV or Drag & Drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569' }}>
                    S.N., Voter ID, Full Name, Age, Gender, Spouse, Father, Mother
                  </Typography>
                  {fileName && (
                    <Chip
                      size="small"
                      color="success"
                      label={fileName}
                      sx={{ mt: 1, fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 3,
                    p: 1.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      📋 Paste from Excel / Google Sheets:
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ContentPasteIcon sx={{ fontSize: 14 }} />}
                      onClick={handleParsePaste}
                      sx={{ py: 0.2, px: 1, fontSize: '0.72rem', bgcolor: '#1e3a6e', fontWeight: 700 }}
                    >
                      Parse Paste
                    </Button>
                  </Box>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="S.N.,Voter ID,Full Name,Age,Gender,Spouse Name,Father Name,Mother Name"
                    InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.75rem' } }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 3,
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    height: '100%'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e3a6e', display: 'block', mb: 1 }}>
                    ⚙️ Batch Defaults (यदि CSV मा वडा/बुथ खाली भएमा):
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Default Ward</InputLabel>
                        <Select
                          value={defaultWard}
                          label="Default Ward"
                          onChange={(e) => setDefaultWard(Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                            <MenuItem key={w} value={w}>
                              वडा नं. {w}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Default Booth"
                        size="small"
                        fullWidth
                        value={defaultBooth}
                        onChange={(e) => setDefaultBooth(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Default Tole"
                        size="small"
                        fullWidth
                        value={defaultTole}
                        onChange={(e) => setDefaultTole(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Duplicate ID</InputLabel>
                        <Select
                          value={duplicateMode}
                          label="Duplicate ID"
                          onChange={(e) => setDuplicateMode(e.target.value)}
                        >
                          <MenuItem value="update">Update Existing</MenuItem>
                          <MenuItem value="skip">Skip Duplicates</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Column Mapping Verification Strip */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1.5,
                p: 1.2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e3a6e' }}>
                  🔍 Column Mapping:
                </Typography>
                {Object.entries(colStatus).map(([colName, isOk]) => (
                  <Chip
                    key={colName}
                    size="small"
                    icon={isOk ? <CheckCircleIcon /> : <WarningAmberIcon />}
                    label={colName}
                    color={isOk ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => toggleAllRows(true)} sx={{ py: 0.2, fontSize: '0.72rem' }}>
                  Select All ({parsedRows.length})
                </Button>
                <Button size="small" variant="outlined" onClick={() => toggleAllRows(false)} sx={{ py: 0.2, fontSize: '0.72rem' }}>
                  Clear
                </Button>
              </Box>
            </Box>

            {/* Live Preview Table matching Official Navy Header Format */}
            <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #cbd5e1', maxHeight: 320 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800, width: 42 }} padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={parsedRows.length > 0 && parsedRows.every((r) => !r.isValid || r.selected)}
                        onChange={(e) => toggleAllRows(e.target.checked)}
                        sx={{ color: '#ffffff', '&.Mui-checked': { color: '#ffffff' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>S.N.</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Voter ID</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Full Name</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Age</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Gender</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Spouse Name</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Father Name</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Mother Name</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Ward/Booth</TableCell>
                    <TableCell sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedRows.map((r, idx) => (
                    <TableRow key={idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={!!r.selected}
                          disabled={!r.isValid}
                          onChange={() => toggleRowSelection(idx)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{r.serial_no}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e3a6e' }}>
                        {r.voter_id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{r.full_name}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.age || '-'}</TableCell>
                      <TableCell>{r.gender || '-'}</TableCell>
                      <TableCell>{r.spouse_name || '-'}</TableCell>
                      <TableCell>{r.father_name || '-'}</TableCell>
                      <TableCell>{r.mother_name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`W${r.ward_no} • B-${r.booth_no}`}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        {!r.isValid ? (
                          <Chip size="small" color="error" label="Invalid" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        ) : r.isDuplicate ? (
                          <Chip size="small" color="warning" label="Exists (Update)" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        ) : (
                          <Chip size="small" color="success" label="Ready" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          /* TAB 2: OFFICIAL SAMPLE FORMAT PREVIEW (MATCHES UPLOADED IMAGE) */
          <Box sx={{ border: '1.5px solid #cbd5e1', borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                bgcolor: '#f8fafc',
                p: 2,
                borderBottom: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a6e' }}>
                  👁️ निर्वाचन आयोग मतदाता नामावली ढाँचा (Official Voter Roll Format Preview)
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>
                  तपाईंको CSV वा Excel फाइलमा तलको जस्तै ८ वटा मुख्य कलमहरू (S.N. | Voter ID | Full Name | Age | Gender | Spouse Name | Father Name | Mother Name) हुनुपर्छ।
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={sampleLang === 'en' ? 'contained' : 'outlined'}
                  onClick={() => setSampleLang('en')}
                  sx={{ fontWeight: 700, ...(sampleLang === 'en' ? { bgcolor: '#1e3a6e' } : {}) }}
                >
                  🇬🇧 English Format
                </Button>
                <Button
                  size="small"
                  variant={sampleLang === 'ne' ? 'contained' : 'outlined'}
                  onClick={() => setSampleLang('ne')}
                  sx={{ fontWeight: 700, ...(sampleLang === 'ne' ? { bgcolor: '#1e3a6e' } : {}) }}
                >
                  🇳🇵 नेपाली ढाँचा
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1e3a6e' }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>S.N.</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Voter ID</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Full Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Age</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Gender</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Spouse Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Father Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800, py: 1.5 }}>Mother Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeSampleRows.map((r, i) => (
                    <TableRow key={i} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ fontWeight: 800 }}>{r.serial_no}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e3a6e' }}>
                        {r.voter_id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{r.full_name}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{r.age}</TableCell>
                      <TableCell>{r.gender}</TableCell>
                      <TableCell>{r.spouse_name}</TableCell>
                      <TableCell>{r.father_name}</TableCell>
                      <TableCell>{r.mother_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          कुल {parsedRows.length} पङ्क्ति मध्ये {selectedValidRows.length} जना मतदाता Supabase Cloud मा अपलोडका लागि तयार
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700 }}>
            रद्द गर्नुहोस् (Cancel)
          </Button>
          <Button
            onClick={handleExecuteImport}
            variant="contained"
            disabled={importing || selectedValidRows.length === 0}
            sx={{ bgcolor: '#16a34a', fontWeight: 800, '&:hover': { bgcolor: '#15803d' } }}
          >
            {importing
              ? 'Supabase मा अपलोड हुँदैछ...'
              : `✅ Import ${selectedValidRows.length} Voters to Supabase`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
