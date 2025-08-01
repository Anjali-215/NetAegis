import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Assessment,
  Download,
  PictureAsPdf,
  TableChart,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Visibility,
  Delete,
  TrendingUp,
  Security,
  People,
  Upload,
  Report,
  GetApp,
  Description
} from '@mui/icons-material';
import ReportGenerator from '../../components/ReportGenerator';

const Reports = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Get user profile from localStorage or context
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setUserProfile(profile);
  }, []);

  const handleReportGenerated = (reportData) => {
    setSnackbar({
      open: true,
      message: `Report "${reportData.report_id}" generated successfully!`,
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Reports & Analytics
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Generate comprehensive security reports with detailed threat analysis, user activity, and system performance metrics. 
          Reports include profile details, threat statistics, and visualizations.
        </Typography>
      </Alert>

      <ReportGenerator 
        onReportGenerated={handleReportGenerated}
        userProfile={userProfile}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Reports; 