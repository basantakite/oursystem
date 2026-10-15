import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { usePartyTheme } from '../context/PartyThemeContext';
import { upsertVoter } from '../supabaseClient';

function computeAgeGroup(ageVal, currentGroup) {
  const n = Number(ageVal);
  if (!isNaN(n) && n >= 18) {
    if (n <= 25) return '18-25';
    if (n <= 40) return '26-40';
    if (n <= 60) return '41-60';
    return '60+';
  }
  return currentGroup || '';
}

export default function VoterEditModal({ open, onClose, voter, onSaveSuccess }) {
  const { partyConfig } = usePartyTheme();
  const [formData, setFormData] = useState({
    serial_no: '',
    voter_id: '',
    full_name: '',
    age: '',
    gender: '',
    spouse_name: '',
    father_name: '',
    mother_name: '',
    phone: '',
    ward_no: 1,
    tole: '',
    booth_no: 'A',
    party_leaning: 'Undecided',
    sentiment: 'swing',
    voted_status: false,
    address: '',
    age_group: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (voter) {
      setFormData({
        serial_no: voter.serial_no || '',
        voter_id: voter.voter_id || '',
        full_name: voter.full_name || '',
        age: voter.age || '',
        gender: voter.gender || '',
        spouse_name: voter.spouse_name || '',
        father_name: voter.father_name || '',
        mother_name: voter.mother_name || '',
        phone: voter.phone || '',
        ward_no: voter.ward_no || 1,
        tole: voter.tole || '',
        booth_no: voter.booth_no || 'A',
        party_leaning: voter.party_leaning || 'Undecided',
        sentiment: voter.sentiment || 'swing',
        voted_status: !!voter.voted_status,
        address: voter.address || '',
        age_group: voter.age_group || ''
      });
    }
  }, [voter]);

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'age') {
        next.age_group = computeAgeGroup(val, prev.age_group);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await upsertVoter(formData);
      if (onSaveSuccess) onSaveSuccess(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save voter:', err);
      alert('मतदाता सुरक्षित गर्न सकिएन: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid #e2e8f0', bgcolor: '#1e3a6e', color: '#ffffff' }}>
        {voter && voter.full_name ? 'मतदाता विवरण सम्पादन (Edit Voter Record)' : 'नयाँ मतदाता दर्ता (Add Voter Record)'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e3a6e', textTransform: 'uppercase', display: 'block', mb: 1.5, mt: 1 }}>
          १. आधिकारिक मतदाता नामावली विवरण (Official Voter Roll Fields)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="S.N. (क्रम संख्या)"
              size="small"
              fullWidth
              value={formData.serial_no}
              onChange={(e) => handleChange('serial_no', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Voter ID (मतदाता नं.) *"
              size="small"
              fullWidth
              value={formData.voter_id}
              onChange={(e) => handleChange('voter_id', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Full Name (पूरा नाम) *"
              size="small"
              fullWidth
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="Age (उमेर)"
              size="small"
              type="number"
              fullWidth
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender (लिङ्ग)</InputLabel>
              <Select
                value={formData.gender}
                label="Gender (लिङ्ग)"
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <MenuItem value="Male">पुरुष (Male)</MenuItem>
                <MenuItem value="Female">महिला (Female)</MenuItem>
                <MenuItem value="Other">अन्य (Other)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Spouse Name (पति / पत्नीको नाम)"
              size="small"
              fullWidth
              value={formData.spouse_name}
              onChange={(e) => handleChange('spouse_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Father Name (बुबाको नाम)"
              size="small"
              fullWidth
              value={formData.father_name}
              onChange={(e) => handleChange('father_name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mother Name (आमाको नाम)"
              size="small"
              fullWidth
              value={formData.mother_name}
              onChange={(e) => handleChange('mother_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', textTransform: 'uppercase', display: 'block', mt: 1 }}>
              २. वडा, बुथ तथा चुनावी सम्पर्क (Location & Campaign Fields)
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="वडा नं. (Ward)"
              size="small"
              type="number"
              fullWidth
              value={formData.ward_no}
              onChange={(e) => handleChange('ward_no', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="बुथ (Booth)"
              size="small"
              fullWidth
              value={formData.booth_no}
              onChange={(e) => handleChange('booth_no', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="टोल / गाउँ (Tole)"
              size="small"
              fullWidth
              value={formData.tole}
              onChange={(e) => handleChange('tole', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="मोबाइल नम्बर (Phone)"
              size="small"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>पार्टी झुकाव (Party Leaning)</InputLabel>
              <Select
                value={formData.party_leaning}
                label="पार्टी झुकाव (Party Leaning)"
                onChange={(e) => handleChange('party_leaning', e.target.value)}
              >
                <MenuItem value="NC">नेपाली काँग्रेस (NC)</MenuItem>
                <MenuItem value="UML">नेकपा (एमाले)</MenuItem>
                <MenuItem value="RSP">राष्ट्रिय स्वतन्त्र पार्टी (RSP)</MenuItem>
                <MenuItem value="Maoist">माओवादी केन्द्र</MenuItem>
                <MenuItem value="RPP">राप्रपा (RPP)</MenuItem>
                <MenuItem value="Independent">स्वतन्त्र</MenuItem>
                <MenuItem value="Undecided">अनिर्णित (Undecided)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>मतदाता भावना (Sentiment)</InputLabel>
              <Select
                value={formData.sentiment}
                label="मतदाता भावना (Sentiment)"
                onChange={(e) => handleChange('sentiment', e.target.value)}
              >
                <MenuItem value="solid">पक्का समर्थक (Solid)</MenuItem>
                <MenuItem value="favorable">सकारात्मक (Favorable)</MenuItem>
                <MenuItem value="swing">अनिर्णित / स्विङ (Swing)</MenuItem>
                <MenuItem value="opposed">विपक्षी (Opposed)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.voted_status}
                    onChange={(e) => handleChange('voted_status', e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formData.voted_status ? '✓ भोट खस्यो (Voted)' : '✕ बाँकी (Not Voted)'}
                  </Typography>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          रद्द गर्नुहोस्
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{ bgcolor: partyConfig.primary, fontWeight: 700 }}
        >
          {saving ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
