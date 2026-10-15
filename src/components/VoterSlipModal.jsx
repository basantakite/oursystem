import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { usePartyTheme } from '../context/PartyThemeContext';

export default function VoterSlipModal({ open, onClose, voter }) {
  const { settings } = useAuth();
  const { partyConfig } = usePartyTheme();

  if (!voter) return null;

  const municipality = settings?.municipality_name || 'हेलम्बु गाउँपालिका (Helambu Rural Municipality)';

  const handleShareWhatsApp = () => {
    const text =
      `🇳🇵 *${municipality} - मतदाता परिचय पर्चा*\n` +
      `----------------------------------------\n` +
      `🔢 *S.N. (क्र.सं.):* ${voter.serial_no || '-'}\n` +
      `🆔 *Voter ID:* ${voter.voter_id || '-'}\n` +
      `👤 *Full Name:* ${voter.full_name || '-'}\n` +
      `🎂 *Age / Gender:* ${voter.age || voter.age_group || '-'} / ${voter.gender || '-'}\n` +
      `💍 *Spouse Name:* ${voter.spouse_name || '-'}\n` +
      `👨 *Father Name:* ${voter.father_name || '-'}\n` +
      `👩 *Mother Name:* ${voter.mother_name || '-'}\n` +
      `🏛️ *Ward / Booth:* वडा ${voter.ward_no || 1} • बुथ ${voter.booth_no || 'A'} (${voter.tole || '-'})\n` +
      `----------------------------------------\n` +
      `📌 मतदान गर्न जाँदा सक्कल मतदाता परिचयपत्र वा नागरिकता अनिवार्य साथमा लैजानुहोला।`;
    const cleanPhone = String(voter.phone || '').replace(/[^0-9]/g, '');
    const url =
      cleanPhone.length >= 10
        ? `https://api.whatsapp.com/send?phone=977${cleanPhone.slice(-10)}&text=${encodeURIComponent(text)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          bgcolor: '#1e3a6e',
          color: '#ffffff',
          fontWeight: 800,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>🇳🇵 आधिकारिक मतदाता परिचय पर्चा (Voter Information Slip)</span>
        <IconButton size="small" onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Box
          sx={{
            border: '2px solid #1e3a6e',
            borderRadius: 2.5,
            p: 2.5,
            bgcolor: '#ffffff'
          }}
        >
          {/* Slip Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                🇳🇵 {municipality}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                मतदाता नामावली परिचय पर्चा (Official Electoral Roll Slip)
              </Typography>
            </Box>
            <Chip
              label={`${partyConfig.symbol} ${partyConfig.name}`}
              size="small"
              sx={{ bgcolor: partyConfig.accentBg, color: partyConfig.primary, fontWeight: 800 }}
            />
          </Box>

          {/* Navy Banner */}
          <Box
            sx={{
              bgcolor: '#1e3a6e',
              color: '#ffffff',
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                S.N. (मतदाता क्रम संख्या)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                #{voter.serial_no || '-'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Voter ID (मतदाता नं.)
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900, lineHeight: 1.1 }}>
                {voter.voter_id}
              </Typography>
            </Box>
          </Box>

          {/* 8-Field Official Details Grid */}
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Full Name (मतदाताको नाम)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {voter.full_name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Age (उमेर)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {voter.age || voter.age_group || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Gender (लिङ्ग)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {voter.gender || '-'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Spouse Name (पति / पत्नीको नाम)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {voter.spouse_name || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Ward / Booth / Tole
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e3a6e' }}>
                  वडा {voter.ward_no || 1} • बुथ {voter.booth_no || 'A'} {voter.tole ? `(${voter.tole})` : ''}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Father Name (बुबाको नाम)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {voter.father_name || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Mother Name (आमाको नाम)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {voter.mother_name || '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
            📌 <b>सूचना:</b> मतदान गर्न जाँदा सक्कल मतदाता परिचयपत्र वा नेपाली नागरिकताको प्रमाणपत्र अनिवार्य साथमा लिएर जानुहोला।
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700 }}>
          बन्द गर्नुहोस्
        </Button>
        <Button
          variant="contained"
          startIcon={<WhatsAppIcon />}
          onClick={handleShareWhatsApp}
          sx={{ bgcolor: '#16a34a', fontWeight: 800 }}
        >
          WhatsApp मा पठाउनुहोस्
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ bgcolor: '#1e3a6e', fontWeight: 800 }}
        >
          Print पर्चा
        </Button>
      </DialogActions>
    </Dialog>
  );
}
