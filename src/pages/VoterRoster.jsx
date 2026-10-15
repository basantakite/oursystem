import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { usePartyTheme } from '../context/PartyThemeContext';
import { useAuth } from '../context/AuthContext';
import { toggleVoterPollingStatus } from '../supabaseClient';
import VoterEditModal from '../components/VoterEditModal';
import VoterBulkImportModal from '../components/VoterBulkImportModal';
import VoterSlipModal from '../components/VoterSlipModal';

export default function VoterRoster({ voters = [], onRefreshVoters }) {
  const { partyConfig } = usePartyTheme();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'superadmin';

  // View & Table state
  const [viewMode, setViewMode] = useState('table'); // 'table' (Official Roll Table) or 'cards' (Touch Cards)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All', 'voted', 'remaining'
  const [selectedBooth, setSelectedBooth] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [orderBy, setOrderBy] = useState('serial_no');
  const [orderDir, setOrderDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [updatingVoterId, setUpdatingVoterId] = useState(null);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeVoter, setActiveVoter] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInitialTab, setImportInitialTab] = useState(0);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [slipVoter, setSlipVoter] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setOrderDir('asc');
    }
  };

  // Filtered & Sorted voters
  const filteredVoters = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const list = voters.filter((v) => {
      if (q) {
        const hay = [
          v.serial_no,
          v.voter_id,
          v.full_name,
          v.age,
          v.gender,
          v.spouse_name,
          v.father_name,
          v.mother_name,
          v.phone,
          v.tole
        ]
          .map((x) => String(x || '').toLowerCase())
          .join(' ');
        if (!hay.includes(q)) return false;
      }

      if (selectedWard !== 'All' && String(v.ward_no) !== String(selectedWard)) return false;
      if (selectedStatus === 'voted' && !v.voted_status) return false;
      if (selectedStatus === 'remaining' && v.voted_status) return false;
      if (selectedBooth !== 'All' && (v.booth_no || 'A') !== selectedBooth) return false;
      if (selectedGender !== 'All') {
        const g = String(v.gender || '').toLowerCase();
        if (selectedGender === 'Male' && g !== 'male' && g !== 'पुरुष') return false;
        if (selectedGender === 'Female' && g !== 'female' && g !== 'महिला') return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA = a[orderBy] ?? '';
      let valB = b[orderBy] ?? '';
      if (orderBy === 'serial_no' || orderBy === 'age' || orderBy === 'ward_no') {
        const numA = parseInt(valA, 10) || 0;
        const numB = parseInt(valB, 10) || 0;
        return orderDir === 'asc' ? numA - numB : numB - numA;
      }
      const cmp = String(valA).localeCompare(String(valB), 'ne', { sensitivity: 'base' });
      return orderDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [voters, searchTerm, selectedWard, selectedStatus, selectedBooth, selectedGender, orderBy, orderDir]);

  const paginatedVoters = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredVoters.slice(start, start + rowsPerPage);
  }, [filteredVoters, page, rowsPerPage]);

  const handleToggleVote = async (voter) => {
    const newStatus = !voter.voted_status;
    try {
      setUpdatingVoterId(voter.voter_id);
      if (navigator.vibrate) navigator.vibrate(40);
      await toggleVoterPollingStatus(voter.voter_id, newStatus);
      if (onRefreshVoters) onRefreshVoters();
      setToastMsg(`${voter.full_name}: ${newStatus ? '✓ भोट खस्यो (Voted)' : '✕ बाँकी (Not Voted)'}`);
    } catch (err) {
      console.error('Failed to toggle vote status:', err);
    } finally {
      setUpdatingVoterId(null);
    }
  };

  const handleEdit = (v) => {
    setActiveVoter(v);
    setEditModalOpen(true);
  };

  const handleOpenSlip = (v) => {
    setSlipVoter(v);
    setSlipModalOpen(true);
  };

  const handleAddNew = () => {
    setActiveVoter({
      serial_no: String(voters.length + 101),
      voter_id: `${Math.floor(14080000 + Math.random() * 90000)}`,
      full_name: '',
      age: '',
      gender: 'Male',
      spouse_name: '',
      father_name: '',
      mother_name: '',
      phone: '',
      ward_no: selectedWard === 'All' ? 1 : Number(selectedWard),
      tole: '',
      booth_no: 'A',
      party_leaning: 'Undecided',
      voted_status: false
    });
    setEditModalOpen(true);
  };

  const handleExportCsv = () => {
    if (!filteredVoters.length) return;
    const headers = [
      'S.N.',
      'Voter ID',
      'Full Name',
      'Age',
      'Gender',
      'Spouse Name',
      'Father Name',
      'Mother Name',
      'Ward',
      'Tole',
      'BoothNo',
      'Phone',
      'PartyLeaning',
      'VotedStatus'
    ];
    const csvLines = [
      headers.map((h) => `"${h}"`).join(','),
      ...filteredVoters.map((v, i) =>
        [
          v.serial_no || i + 1,
          v.voter_id || '',
          v.full_name || '',
          v.age || v.age_group || '',
          v.gender || '',
          v.spouse_name || '',
          v.father_name || '',
          v.mother_name || '',
          v.ward_no || 1,
          v.tole || '',
          v.booth_no || 'A',
          v.phone || '',
          v.party_leaning || 'Undecided',
          v.voted_status ? 'Voted' : 'Not Voted'
        ]
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvLines], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `helambu_voters_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setToastMsg(`${filteredVoters.length} जना मतदाताको CSV फाइल डाउनलोड भयो!`);
  };

  const formatGenderChip = (g) => {
    const raw = String(g || '').trim();
    const low = raw.toLowerCase();
    if (low === 'male' || raw === 'पुरुष') {
      return (
        <Chip
          size="small"
          label="पुरुष (Male)"
          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700, height: 22, fontSize: '0.72rem' }}
        />
      );
    }
    if (low === 'female' || raw === 'महिला') {
      return (
        <Chip
          size="small"
          label="महिला (Female)"
          sx={{ bgcolor: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', fontWeight: 700, height: 22, fontSize: '0.72rem' }}
        />
      );
    }
    return <Typography variant="caption">{raw || '-'}</Typography>;
  };

  return (
    <Box sx={{ pb: { xs: 9, md: 4 } }}>
      {/* Top Header & Bulk Actions Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              मतदाता नामावली निर्देशिका (Official Voter Roll)
            </Typography>
            <Chip
              size="small"
              label="S.N. • Voter ID • Family Roll"
              sx={{ bgcolor: '#eff6ff', color: '#1e3a6e', border: '1px solid #bfdbfe', fontWeight: 800 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            देखाउँदै {filteredVoters.length} / जम्मा {voters.length} मतदाता • React + Supabase Live Sync
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <TableChartIcon />}
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            sx={{ fontWeight: 700, borderRadius: 2.5, borderColor: '#cbd5e1', color: '#1e293b' }}
          >
            {viewMode === 'table' ? '🔲 Card View' : '📋 Official Roll Table'}
          </Button>

          {isSuperAdmin ? (
            <>
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => {
                  setImportInitialTab(0);
                  setImportModalOpen(true);
                }}
                sx={{
                  bgcolor: '#1e3a6e',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#162d56' }
                }}
              >
                📤 Bulk Upload CSV
              </Button>

              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => {
                  setImportInitialTab(1);
                  setImportModalOpen(true);
                }}
                sx={{
                  borderColor: '#93c5fd',
                  bgcolor: '#eff6ff',
                  color: '#1e3a6e',
                  fontWeight: 800,
                  borderRadius: 2.5
                }}
              >
                👁️ Sample Preview
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCsv}
                sx={{ fontWeight: 700, borderRadius: 2.5 }}
              >
                Export CSV
              </Button>
            </>
          ) : (
            <Chip
              size="small"
              label="🔒 Bulk Import/Export Super Admin मा सीमित"
              sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, height: 32 }}
            />
          )}

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddNew}
            sx={{
              bgcolor: partyConfig.primary,
              fontWeight: 800,
              borderRadius: 2.5
            }}
          >
            + नयाँ मतदाता
          </Button>
        </Box>
      </Box>

      {/* Instant Search & Filter Bar */}
      <Card sx={{ mb: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', p: 1.8 }}>
        <TextField
          fullWidth
          placeholder="खोज्नुहोस्: S.N., Voter ID, Full Name, Age, Spouse Name, Father Name, Mother Name, Phone, Tole..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#1e3a6e' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2.5, bgcolor: '#f8fafc' }
          }}
          size="small"
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={`सबै (${voters.length})`}
            clickable
            color={selectedStatus === 'All' ? 'primary' : 'default'}
            onClick={() => {
              setSelectedStatus('All');
              setPage(0);
            }}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`✓ भोट खसेको (${voters.filter((v) => v.voted_status).length})`}
            clickable
            color={selectedStatus === 'voted' ? 'success' : 'default'}
            onClick={() => {
              setSelectedStatus('voted');
              setPage(0);
            }}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`✕ खस्न बाँकी (${voters.filter((v) => !v.voted_status).length})`}
            clickable
            color={selectedStatus === 'remaining' ? 'error' : 'default'}
            onClick={() => {
              setSelectedStatus('remaining');
              setPage(0);
            }}
            sx={{ fontWeight: 700 }}
          />

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 115 }}>
              <InputLabel>लिङ्ग (Gender)</InputLabel>
              <Select
                value={selectedGender}
                label="लिङ्ग (Gender)"
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">सबै (All)</MenuItem>
                <MenuItem value="Male">पुरुष (Male)</MenuItem>
                <MenuItem value="Female">महिला (Female)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 115 }}>
              <InputLabel>वडा छान्नुहोस्</InputLabel>
              <Select
                value={selectedWard}
                label="वडा छान्नुहोस्"
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">सबै वडा</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                  <MenuItem key={w} value={w}>
                    वडा नं. {w}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 105 }}>
              <InputLabel>बुथ (Booth)</InputLabel>
              <Select
                value={selectedBooth}
                label="बुथ (Booth)"
                onChange={(e) => {
                  setSelectedBooth(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">सबै बुथ</MenuItem>
                <MenuItem value="A">बुथ क (A)</MenuItem>
                <MenuItem value="B">बुथ ख (B)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Card>

      {/* VIEW 1: OFFICIAL VOTER ROLL TABLE (Matches Uploaded Reference Image 100%) */}
      {viewMode === 'table' ? (
        <Paper sx={{ borderRadius: 3, border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.05)' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1e3a6e' }}>
                  {[
                    { id: 'serial_no', label: 'S.N.', align: 'center' },
                    { id: 'voter_id', label: 'Voter ID', align: 'left' },
                    { id: 'full_name', label: 'Full Name', align: 'left' },
                    { id: 'age', label: 'Age', align: 'center' },
                    { id: 'gender', label: 'Gender', align: 'center' },
                    { id: 'spouse_name', label: 'Spouse Name', align: 'left' },
                    { id: 'father_name', label: 'Father Name', align: 'left' },
                    { id: 'mother_name', label: 'Mother Name', align: 'left' },
                    { id: 'ward_no', label: 'Ward / Booth', align: 'left' }
                  ].map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      sx={{
                        bgcolor: '#1e3a6e',
                        color: '#ffffff',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        py: 1.6,
                        borderBottom: '2px solid #0f2140'
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? orderDir : 'asc'}
                        onClick={() => handleSort(col.id)}
                        sx={{
                          color: '#ffffff !important',
                          '& .MuiTableSortLabel-icon': { color: '#93c5fd !important' }
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap', py: 1.6 }}
                  >
                    1-Tap Vote
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#1e3a6e', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap', py: 1.6 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedVoters.map((v, idx) => {
                  const isVoted = !!v.voted_status;
                  const isUpdating = updatingVoterId === v.voter_id;
                  return (
                    <TableRow
                      key={v.voter_id}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: isVoted ? '#f0fdf4' : '#f8fafc' },
                        bgcolor: isVoted ? '#f0fdf4' : '#ffffff'
                      }}
                    >
                      {/* 1. S.N. */}
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={v.serial_no || page * rowsPerPage + idx + 1}
                          sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#1e293b', height: 22, fontSize: '0.75rem' }}
                        />
                      </TableCell>

                      {/* 2. Voter ID */}
                      <TableCell>
                        <Tooltip title="Click to Copy Voter ID">
                          <Chip
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(v.voter_id);
                              setToastMsg(`Voter ID कपी भयो: ${v.voter_id}`);
                            }}
                            icon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            label={v.voter_id}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              bgcolor: '#eff6ff',
                              color: '#1e3a6e',
                              border: '1px solid #bfdbfe',
                              height: 24,
                              cursor: 'pointer'
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* 3. Full Name */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {v.full_name}
                        </Typography>
                        {v.phone && (
                          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                            📞 {v.phone}
                          </Typography>
                        )}
                      </TableCell>

                      {/* 4. Age */}
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {v.age || v.age_group || '-'}
                      </TableCell>

                      {/* 5. Gender */}
                      <TableCell align="center">{formatGenderChip(v.gender)}</TableCell>

                      {/* 6. Spouse Name */}
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{v.spouse_name || '-'}</TableCell>

                      {/* 7. Father Name */}
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{v.father_name || '-'}</TableCell>

                      {/* 8. Mother Name */}
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{v.mother_name || '-'}</TableCell>

                      {/* 9. Ward / Booth */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={`वडा ${v.ward_no} • बुथ ${v.booth_no || 'A'}`}
                          sx={{ fontWeight: 700, bgcolor: partyConfig.accentBg, color: partyConfig.primary, height: 22, fontSize: '0.72rem' }}
                        />
                        {v.tole && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 0.2 }}>
                            {v.tole}
                          </Typography>
                        )}
                      </TableCell>

                      {/* 10. 1-Tap Vote Toggle */}
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={isVoted ? 'contained' : 'outlined'}
                          disabled={isUpdating}
                          onClick={() => handleToggleVote(v)}
                          sx={{
                            py: 0.4,
                            px: 1.2,
                            borderRadius: 2,
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            whiteSpace: 'nowrap',
                            ...(isVoted
                              ? { bgcolor: '#16a34a', color: '#ffffff', '&:hover': { bgcolor: '#15803d' } }
                              : { borderColor: '#cbd5e1', color: '#475569' })
                          }}
                        >
                          {isVoted ? '✓ Voted' : 'बाँकी'}
                        </Button>
                      </TableCell>

                      {/* 11. Actions */}
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="मतदाता पर्चा (Voter Slip)">
                          <IconButton size="small" onClick={() => handleOpenSlip(v)} sx={{ color: '#1e3a6e' }}>
                            <PrintIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="विवरण सम्पादन (Edit Voter)">
                          <IconButton size="small" onClick={() => handleEdit(v)} sx={{ color: '#475569' }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredVoters.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      ) : (
        /* VIEW 2: MOBILE TOUCH CARDS VIEW */
        <Grid container spacing={1.5}>
          {paginatedVoters.map((v, idx) => {
            const isVoted = !!v.voted_status;
            const isUpdating = updatingVoterId === v.voter_id;
            const cleanPhone = (v.phone || '').replace(/[^0-9]/g, '');

            return (
              <Grid item xs={12} sm={6} md={4} key={v.voter_id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: isVoted ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                    bgcolor: isVoted ? '#f0fdf4' : '#ffffff',
                    boxShadow: isVoted ? '0 4px 12px rgba(22, 163, 74, 0.08)' : 'none'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        size="small"
                        label={`S.N. ${v.serial_no || idx + 1} • ID: ${v.voter_id}`}
                        sx={{ fontWeight: 800, bgcolor: '#eff6ff', color: '#1e3a6e', height: 22, fontSize: '0.72rem' }}
                      />
                      <Chip
                        size="small"
                        label={`वडा ${v.ward_no} • बुथ ${v.booth_no || 'A'}`}
                        sx={{ fontWeight: 700, bgcolor: partyConfig.accentBg, color: partyConfig.primary, height: 22, fontSize: '0.72rem' }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0f172a', mb: 0.3 }}>
                      {v.full_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', mb: 1 }}>
                      Age: <b>{v.age || v.age_group || '-'}</b> • Gender: <b>{v.gender || '-'}</b> {v.tole ? `• ${v.tole}` : ''}
                    </Typography>

                    <Box sx={{ bgcolor: '#f8fafc', p: 1, borderRadius: 2, mb: 1.5, border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#334155' }}>
                      <div>💍 Spouse: <b>{v.spouse_name || '-'}</b></div>
                      <div>👨 Father: <b>{v.father_name || '-'}</b></div>
                      <div>👩 Mother: <b>{v.mother_name || '-'}</b></div>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      {cleanPhone ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PhoneIcon sx={{ fontSize: 15 }} />}
                            href={`tel:${cleanPhone}`}
                            sx={{ borderRadius: 2, py: 0.4, px: 1, fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', borderColor: '#cbd5e1' }}
                          >
                            {v.phone}
                          </Button>
                          <IconButton
                            size="small"
                            href={`https://wa.me/977${cleanPhone.slice(-10)}`}
                            target="_blank"
                            sx={{ bgcolor: '#dcfce7', color: '#16a34a' }}
                          >
                            <WhatsAppIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          फोन नम्बर छैन
                        </Typography>
                      )}
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenSlip(v)} sx={{ color: '#1e3a6e' }}>
                          <PrintIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(v)} sx={{ color: '#64748b' }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant={isVoted ? 'contained' : 'outlined'}
                      disabled={isUpdating}
                      onClick={() => handleToggleVote(v)}
                      startIcon={
                        isUpdating ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : isVoted ? (
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                        )
                      }
                      sx={{
                        py: 1,
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        ...(isVoted
                          ? { bgcolor: '#16a34a', color: '#ffffff', '&:hover': { bgcolor: '#15803d' } }
                          : { borderColor: '#cbd5e1', color: '#475569', bgcolor: '#ffffff' })
                      }}
                    >
                      {isVoted ? '✓ भोट खस्यो (Voted)' : 'बाँकी (Not Voted ✕)'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Bulk CSV Import & Sample Preview Studio Modal */}
      <VoterBulkImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        existingVoters={voters}
        initialTab={importInitialTab}
        onImportSuccess={(count) => {
          setToastMsg(`🎉 सफलतापूर्वक ${count} जना मतदाता Supabase मा अपलोड गरियो!`);
          if (onRefreshVoters) onRefreshVoters();
        }}
      />

      {/* Voter Slip Print & Share Modal */}
      <VoterSlipModal
        open={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        voter={slipVoter}
      />

      {/* Edit / Add Voter Modal */}
      <VoterEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        voter={activeVoter}
        onSaveSuccess={() => {
          setToastMsg('मतदाता विवरण सुरक्षित गरियो!');
          if (onRefreshVoters) onRefreshVoters();
        }}
      />

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3500}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToastMsg('')} sx={{ fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
