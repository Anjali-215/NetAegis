import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
  Divider,
  Checkbox,
  FormControlLabel
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
import axios from 'axios';

const ReportGenerator = ({ onReportGenerated, userProfile }) => {
  const [reportForm, setReportForm] = useState({
    report_type: 'threat_summary',
    date_range: '30',
    threat_type: 'all',
    format: 'pdf',
    include_charts: true,
    include_details: true
  });

  const [generatedReports, setGeneratedReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [previewDialog, setPreviewDialog] = useState({ open: false, report: null });
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'threat_summary', label: 'Threat Summary Report', icon: <Security /> },
    { value: 'user_activity', label: 'User Activity Report', icon: <People /> },
    { value: 'system_performance', label: 'System Performance Report', icon: <TrendingUp /> },
    { value: 'threat_detection', label: 'Threat Detection Report', icon: <Assessment /> },
    { value: 'comprehensive', label: 'Comprehensive Security Report', icon: <Report /> }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/reports', {
        params: { user_id: userProfile?.id }
      });
      setGeneratedReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch reports',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axios.post('http://localhost:8000/api/generate-report', {
        ...reportForm,
        user_id: userProfile?.id
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.status === 'completed') {
        setSnackbar({
          open: true,
          message: 'Report generated successfully!',
          severity: 'success'
        });
        
        // Refresh reports list
        await fetchReports();
        
        // Notify parent component
        if (onReportGenerated) {
          onReportGenerated(response.data);
        }
      }

    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to generate report',
        severity: 'error'
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/download/${report._id}`);
      
      // Handle different content types
      if (response.data.content_type === 'application/pdf') {
        // Decode base64 PDF content
        const pdfContent = atob(response.data.content);
        const pdfBlob = new Blob([new Uint8Array(pdfContent.length).map((_, i) => pdfContent.charCodeAt(i))], { 
          type: 'application/pdf' 
        });
        
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle CSV and JSON files
        const blob = new Blob([response.data.content], { 
          type: response.data.content_type || 'text/plain'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download report',
        severity: 'error'
      });
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`http://localhost:8000/api/reports/${reportId}`);
      setSnackbar({
        open: true,
        message: 'Report deleted successfully!',
        severity: 'success'
      });
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete report',
        severity: 'error'
      });
    }
  };

  const handleCreateTestData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/create-test-data');
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
      await fetchReports();
    } catch (error) {
      console.error('Error creating test data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create test data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewReport = (report) => {
    setPreviewDialog({ open: true, report });
  };

  const getReportTypeIcon = (type) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.icon : <Description />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'processing': return <Schedule />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  const formatIcon = (format) => {
    return format === 'pdf' ? <PictureAsPdf /> : <TableChart />;
  };

  return (
    <Box>
      <Grid container rowSpacing={3} columnSpacing={3}>
        {/* Report Generation Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content', backgroundColor: '#23272F', color: '#fff' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Assessment color="primary" />
              <Typography variant="h6">Generate New Report</Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Reports are generated from your existing ML analysis data. Upload and process CSV files in the CSV Upload section to see results here.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportForm.report_type}
                  label="Report Type"
                  onChange={(e) => handleFormChange('report_type', e.target.value)}
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
                  value={reportForm.date_range}
                  label="Date Range"
                  onChange={(e) => handleFormChange('date_range', e.target.value)}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Threat Type Filter</InputLabel>
                <Select
                  value={reportForm.threat_type}
                  label="Threat Type Filter"
                  onChange={(e) => handleFormChange('threat_type', e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="ddos">DDoS</MenuItem>
                  <MenuItem value="dos">DoS</MenuItem>
                  <MenuItem value="scanning">Scanning</MenuItem>
                  <MenuItem value="injection">Injection</MenuItem>
                  <MenuItem value="backdoor">Backdoor</MenuItem>
                  <MenuItem value="ransomware">Ransomware</MenuItem>
                  <MenuItem value="mitm">Man-in-the-Middle</MenuItem>
                  <MenuItem value="password">Password Attack</MenuItem>
                  <MenuItem value="xss">XSS</MenuItem>
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportForm.include_charts}
                    onChange={(e) => handleFormChange('include_charts', e.target.checked)}
                  />
                }
                label="Include Charts & Visualizations"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportForm.include_details}
                    onChange={(e) => handleFormChange('include_details', e.target.checked)}
                  />
                }
                label="Include Detailed Threat Data"
              />

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

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Upload />}
                onClick={handleCreateTestData}
                disabled={loading}
                sx={{ 
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#45a049',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
                  }
                }}
              >
                Create Test Data
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
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Generated Reports</Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchReports}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <LinearProgress />
              </Box>
            ) : generatedReports.length === 0 ? (
              <Box textAlign="center" p={3}>
                <Typography variant="body2" color="text.secondary">
                  No reports generated yet. Create your first report using the form on the left.
                </Typography>
              </Box>
            ) : (
              <List>
                {generatedReports.map((report, index) => (
                  <Box key={report._id}>
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
                              onClick={() => handleDeleteReport(report._id)}
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
                          {getReportTypeIcon(report.report_type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight="medium">
                              {report.content?.title || `Report ${report._id}`}
                            </Typography>
                            <Chip 
                              label={report.status} 
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                            {formatIcon(report.format)}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Generated: {new Date(report.generated_date).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Date Range: {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < generatedReports.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Report Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, report: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Report Preview: {previewDialog.report?.content?.title}
        </DialogTitle>
        <DialogContent>
          {previewDialog.report && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {previewDialog.report.content?.summary?.total_threats || 0}
                      </Typography>
                      <Typography variant="body2">Total Threats</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {previewDialog.report.content?.system_stats?.total_users || 0}
                      </Typography>
                      <Typography variant="body2">Active Users</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {(previewDialog.report.content?.system_stats?.model_accuracy * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">Model Accuracy</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="info.main">
                        {Object.keys(previewDialog.report.content?.summary?.threat_types || {}).length}
                      </Typography>
                      <Typography variant="body2">Threat Types</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Threat Type Distribution
              </Typography>
              <Box mb={3}>
                {Object.entries(previewDialog.report.content?.summary?.threat_types || {}).map(([type, count]) => (
                  <Box key={type} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{type}</Typography>
                    <Chip label={count} size="small" />
                  </Box>
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Top Threat Sources
              </Typography>
              <Box mb={3}>
                {previewDialog.report.content?.summary?.top_sources?.slice(0, 5).map(([source, count]) => (
                  <Box key={source} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">{source}</Typography>
                    <Chip label={count} size="small" />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, report: null })}>
            Close
          </Button>
          {previewDialog.report && (
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={() => handleDownloadReport(previewDialog.report)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default ReportGenerator; 