import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
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
  Upload
} from '@mui/icons-material';

const Reports = () => {
  const [reportForm, setReportForm] = useState({
    reportType: 'threat_summary',
    dateRange: '30',
    threatType: 'all',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true
  });

  const [generatedReports, setGeneratedReports] = useState([
    {
      id: 1,
      name: 'Threat Summary Report - December 2023',
      type: 'threat_summary',
      format: 'pdf',
      generatedDate: '2024-01-15 10:30',
      status: 'completed',
      size: '2.4 MB',
      downloadUrl: '#'
    },
    {
      id: 2,
      name: 'User Activity Report - Q4 2023',
      type: 'user_activity',
      format: 'csv',
      generatedDate: '2024-01-14 15:45',
      status: 'completed',
      size: '1.8 MB',
      downloadUrl: '#'
    },
    {
      id: 3,
      name: 'System Performance Report - January 2024',
      type: 'system_performance',
      format: 'pdf',
      generatedDate: '2024-01-15 09:20',
      status: 'processing',
      size: '0 MB',
      downloadUrl: null
    },
    {
      id: 4,
      name: 'Threat Detection Report - November 2023',
      type: 'threat_detection',
      format: 'pdf',
      generatedDate: '2024-01-13 14:15',
      status: 'completed',
      size: '3.1 MB',
      downloadUrl: '#'
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewDialog, setPreviewDialog] = useState({ open: false, report: null });

  const reportTypes = [
    { value: 'threat_summary', label: 'Threat Summary Report', icon: <Security /> },
    { value: 'threat_detection', label: 'Threat Detection Report', icon: <Assessment /> },
    { value: 'user_activity', label: 'User Activity Report', icon: <People /> },
    { value: 'system_performance', label: 'System Performance Report', icon: <TrendingUp /> },
    { value: 'csv_upload_summary', label: 'CSV Upload Summary', icon: <Upload /> }
  ];

  const handleFormChange = (field, value) => {
    setReportForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate report generation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          // Add new report to list
          const newReport = {
            id: generatedReports.length + 1,
            name: `${reportTypes.find(t => t.value === reportForm.reportType)?.label} - ${new Date().toLocaleDateString()}`,
            type: reportForm.reportType,
            format: reportForm.format,
            generatedDate: new Date().toLocaleString(),
            status: 'completed',
            size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
            downloadUrl: '#'
          };
          
          setGeneratedReports([newReport, ...generatedReports]);
          setSnackbar({ open: true, message: 'Report generated successfully!', severity: 'success' });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownloadReport = (report) => {
    setSnackbar({ open: true, message: `Downloading ${report.name}...`, severity: 'info' });
  };

  const handleDeleteReport = (reportId) => {
    setGeneratedReports(generatedReports.filter(report => report.id !== reportId));
    setSnackbar({ open: true, message: 'Report deleted successfully!', severity: 'success' });
  };

  const handlePreviewReport = (report) => {
    setPreviewDialog({ open: true, report });
  };

  const getReportTypeIcon = (type) => {
    const reportType = reportTypes.find(t => t.value === type);
    return reportType ? reportType.icon : <Assessment />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'primary'; // red
      case 'processing':
        return 'default'; // neutral
      case 'error':
        return 'error'; // red
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'processing':
        return <Refresh />;
      case 'error':
        return <Error />;
      default:
        return <Info />;
    }
  };

  const formatIcon = (format) => {
    return format === 'pdf' ? <PictureAsPdf /> : <TableChart />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Reports & Export
      </Typography>

      <Grid container rowSpacing={3} columnSpacing={3}>
        {/* Report Generation Form */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content', backgroundColor: '#23272F', color: '#fff' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Assessment color="primary" />
              <Typography variant="h6">Generate New Report</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportForm.reportType}
                  label="Report Type"
                  onChange={(e) => handleFormChange('reportType', e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={reportForm.dateRange}
                  label="Date Range"
                  onChange={(e) => handleFormChange('dateRange', e.target.value)}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                  <MenuItem value="custom">Custom range</MenuItem>
                </Select>
              </FormControl>

              {reportForm.dateRange === 'custom' && (
                <Grid container spacing={1}>
                  <Grid xs={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}

              <FormControl fullWidth>
                <InputLabel>Threat Type Filter</InputLabel>
                <Select
                  value={reportForm.threatType}
                  label="Threat Type Filter"
                  onChange={(e) => handleFormChange('threatType', e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="malware">Malware</MenuItem>
                  <MenuItem value="ddos">DDoS</MenuItem>
                  <MenuItem value="phishing">Phishing</MenuItem>
                  <MenuItem value="sqlinjection">SQL Injection</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={reportForm.format}
                  label="Export Format"
                  onChange={(e) => handleFormChange('format', e.target.value)}
                >
                  <MenuItem value="pdf">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PictureAsPdf />
                      PDF Document
                    </Box>
                  </MenuItem>
                  <MenuItem value="csv">
                    <Box display="flex" alignItems="center" gap={1}>
                      <TableChart />
                      CSV Spreadsheet
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Assessment />}
                onClick={handleGenerateReport}
                disabled={isGenerating}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>

              {isGenerating && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary">
                    {progress}% complete
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Generated Reports List */}
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Generated Reports</Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setSnackbar({ open: true, message: 'Reports refreshed!', severity: 'info' })}
              >
                Refresh
              </Button>
            </Box>

            <List>
              {generatedReports.map((report, index) => (
                <Box key={report.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    secondaryAction={
                      <Box display="flex" gap={1}>
                        <Tooltip title="Preview Report">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePreviewReport(report)}
                            disabled={report.status !== 'completed'}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Download Report">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownloadReport(report)}
                            disabled={report.status !== 'completed'}
                            color="primary"
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Report">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteReport(report.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getReportTypeIcon(report.type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {report.name}
                          </Typography>
                          <Chip 
                            label={report.status} 
                            color={getStatusColor(report.status)}
                            size="small"
                            icon={getStatusIcon(report.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Generated: {report.generatedDate} • Size: {report.size}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            {formatIcon(report.format)}
                            <Typography variant="caption" color="text.secondary">
                              {report.format.toUpperCase()} format
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < generatedReports.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </List>

            {generatedReports.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No reports generated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate your first report using the form on the left.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Report Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, report: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report Preview: {previewDialog.report?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This is a preview of the generated report. The actual report will contain detailed data and charts.
            </Typography>
            
            <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Report Summary
              </Typography>
              <Grid container columns={12} rowSpacing={2} columnSpacing={2}>
                <Grid xs={6}>
                  <Typography variant="body2">
                    <strong>Report Type:</strong> {previewDialog.report?.type}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">
                    <strong>Format:</strong> {previewDialog.report?.format?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">
                    <strong>Generated:</strong> {previewDialog.report?.generatedDate}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="body2">
                    <strong>Size:</strong> {previewDialog.report?.size}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, report: null })}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={() => {
              handleDownloadReport(previewDialog.report);
              setPreviewDialog({ open: false, report: null });
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Reports can be generated in PDF or CSV format. PDF reports include charts and visualizations, 
          while CSV reports contain raw data for further analysis. Generated reports are stored for 30 days.
        </Typography>
      </Alert>

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