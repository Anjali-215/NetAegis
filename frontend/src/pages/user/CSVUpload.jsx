import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import apiService, { predictThreatNoEmail, checkApiHealth, saveMLResults, sendCSVSummaryEmail } from '../../services/api';
import { preprocessNetworkData, detectColumnMappings } from '../../utils/preprocessor';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Skeleton,
  Chip,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextareaAutosize,
  Grid
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh,
  Delete,
  Visibility,
  Add as AddIcon,
  DataObject as JsonIcon,
  Edit as EditIcon,
  Assessment,
  Download
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const UserCSVUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResults, setPredictionResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [resultsDialog, setResultsDialog] = useState({ open: false, results: null, file: null });
  const [fileMeta, setFileMeta] = useState(null); // {name, size, uploadTime, recordCount}
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [jsonData, setJsonData] = useState('');
  const [manualEntryDialog, setManualEntryDialog] = useState({ open: false, data: {} });
  const [singlePredictionDialog, setSinglePredictionDialog] = useState({ open: false, result: null });
  const [columnMappingDialog, setColumnMappingDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const initializeComponent = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        // Try to get cached user info
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check API health and get user info in parallel
        const [healthCheck, currentUser] = await Promise.allSettled([
          checkApiHealth(),
          !userInfo.email ? apiService.getCurrentUser() : Promise.resolve(userInfo)
        ]);

        // Handle API health check result
        if (healthCheck.status === 'fulfilled') {
          setApiStatus('connected');
        } else {
          console.error('API health check failed:', healthCheck.reason);
          setApiStatus('error');
        }

        // Handle user info result
        if (currentUser.status === 'fulfilled' && currentUser.value) {
          localStorage.setItem('user', JSON.stringify(currentUser.value));
        } else if (currentUser.reason?.response?.status === 401) {
          console.log('Token invalid, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        } else {
          console.error('Error getting user info:', currentUser.reason);
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        setApiStatus('error');
      }
    };

    initializeComponent();
  }, [navigate]);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(file => {
      handleFileUpload(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#b71c1c' }} />;
      case 'processing':
        return <InfoIcon sx={{ color: '#3a2323' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#ff5252' }} />;
      default:
        return <WarningIcon sx={{ color: '#c50e29' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'primary';
      case 'processing':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSelectedFile(file);
    setPredictionResults([]);

    try {
      const text = await file.text();
      let data = [];
      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
          });
          return row;
        });
      }

      const newFile = {
        id: Date.now(),
      name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'completed',
        uploadDate: new Date().toLocaleString(),
        records: data.length,
        errors: 0,
        data: data
      };

      setUploadedFiles([newFile]);
    setUploadProgress(100);
    setIsUploading(false);

      // Automatically process the file after upload
      handleProcessWithML(newFile);
    } catch (error) {
      console.error('Error reading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      alert('Error processing file: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handlePreviewFile = (file) => {
    if (file.data) {
      const top5Records = file.data.slice(0, 5);
      setResultsDialog({ open: true, results: top5Records, file: file });
    }
  };

  const downloadTemplate = () => {
    const templateContent = `src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,missed_bytes,src_pkts,src_ip_bytes,dst_pkts,dst_ip_bytes,dns_query,dns_qclass,dns_qtype,dns_rcode,dns_AA,dns_RD,dns_RA,dns_rejected,http_request_body_len,http_response_body_len,http_status_code,label
192.168.1.100,80,192.168.1.200,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,0
192.168.1.101,22,192.168.1.201,22,tcp,ssh,0.1,64,0,REJ,0,1,64,1,40,0,0,0,0,none,none,none,none,0,0,0,1
192.168.1.102,53,8.8.8.8,53,udp,dns,0.05,86,235,SF,0,2,142,2,291,google.com,1,1,0,F,T,T,F,0,0,0,0`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'netaegis_csv_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleManualPrediction = async () => {
    try {
      // Fill in default values for missing fields
      const completeData = {
        src_ip: manualEntryDialog.data.src_ip || '',
        src_port: manualEntryDialog.data.src_port || 80,
        dst_ip: manualEntryDialog.data.dst_ip || '',
        dst_port: manualEntryDialog.data.dst_port || 443,
        proto: manualEntryDialog.data.proto || 'tcp',
        service: manualEntryDialog.data.service || '-',
        duration: manualEntryDialog.data.duration || 1.0,
        src_bytes: manualEntryDialog.data.src_bytes || 0,
        dst_bytes: manualEntryDialog.data.dst_bytes || 0,
        conn_state: manualEntryDialog.data.conn_state || 'SF',
        missed_bytes: manualEntryDialog.data.missed_bytes || 0,
        src_pkts: manualEntryDialog.data.src_pkts || 1,
        src_ip_bytes: manualEntryDialog.data.src_ip_bytes || 0,
        dst_pkts: manualEntryDialog.data.dst_pkts || 1,
        dst_ip_bytes: manualEntryDialog.data.dst_ip_bytes || 0,
        dns_query: manualEntryDialog.data.dns_query || 0,
        dns_qclass: manualEntryDialog.data.dns_qclass || 0,
        dns_qtype: manualEntryDialog.data.dns_qtype || 0,
        dns_rcode: manualEntryDialog.data.dns_rcode || 0,
        dns_AA: manualEntryDialog.data.dns_AA || 'none',
        dns_RD: manualEntryDialog.data.dns_RD || 'none',
        dns_RA: manualEntryDialog.data.dns_RA || 'none',
        dns_rejected: manualEntryDialog.data.dns_rejected || 'none',
        http_request_body_len: manualEntryDialog.data.http_request_body_len || 0,
        http_response_body_len: manualEntryDialog.data.http_response_body_len || 0,
        http_status_code: manualEntryDialog.data.http_status_code || 0,
        label: 1  // Always 1 for threat detection prediction
      };
      
      const validation = preprocessNetworkData(completeData);
      if (!validation.isValid) {
        alert('Validation failed: ' + validation.errors.join(', '));
        return;
      }
      
      const prediction = await predictThreatNoEmail(validation.processedData);
      setSinglePredictionDialog({ 
        open: true, 
        result: {
          threatType: prediction.threat_type,
          threatLevel: prediction.threat_level,
          confidence: prediction.confidence,
          inputData: completeData
        }
      });
      setManualEntryDialog({ open: false, data: {} });
    } catch (error) {
      alert('Prediction failed: ' + error.message);
    }
  };

  const handleProcessWithML = async (file) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    const startTime = Date.now();

    try {
                    const results = [];
      const batchSize = 2;
      
      for (let i = 0; i < file.data.length; i += batchSize) {
        const batch = file.data.slice(i, i + batchSize);
        const progress = Math.round((i / file.data.length) * 100);
                      setProcessingProgress(progress);
                      
                      const batchPromises = batch.map(async (row, batchIndex) => {
                        const actualIndex = i + batchIndex;
                        try {
                          const completeRecord = {
                            src_ip: row.src_ip || row.source_ip || row.sourceip || row.orig_h || row['ip.src'] || '192.168.1.1',
                            src_port: parseInt(row.src_port || row.source_port || row.sourceport || row.orig_p || row['tcp.srcport'] || row['udp.srcport'] || 80),
                            dst_ip: row.dst_ip || row.dest_ip || row.destination_ip || row.destip || row.resp_h || row['ip.dst'] || '10.0.0.1',
                            dst_port: parseInt(row.dst_port || row.dest_port || row.destination_port || row.destport || row.resp_p || row['tcp.dstport'] || row['udp.dstport'] || 443),
                            proto: row.proto || row.protocol || row.prot || 'tcp',
                            service: row.service || row.svc || row.srv || '-',
                            duration: parseFloat(row.duration || row.dur || row.time || 1.0),
                            src_bytes: parseInt(row.src_bytes || row.source_bytes || row.orig_bytes || 0),
                            dst_bytes: parseInt(row.dst_bytes || row.dest_bytes || row.destination_bytes || row.resp_bytes || 0),
                            conn_state: row.conn_state || row.connection_state || row.state || 'SF',
                            missed_bytes: parseInt(row.missed_bytes || 0),
                            src_pkts: parseInt(row.src_pkts || row.source_packets || row.orig_pkts || 1),
                            src_ip_bytes: parseInt(row.src_ip_bytes || 0),
                            dst_pkts: parseInt(row.dst_pkts || row.dest_packets || row.destination_packets || row.resp_pkts || 1),
                            dst_ip_bytes: parseInt(row.dst_ip_bytes || 0),
                            dns_query: parseInt(row.dns_query || row.dns_q || 0),
                            dns_qclass: parseInt(row.dns_qclass || row.dns_qc || 0),
                            dns_qtype: parseInt(row.dns_qtype || row.dns_qt || 0),
                            dns_rcode: parseInt(row.dns_rcode || 0),
                            dns_AA: row.dns_AA || row.dns_aa || 'none',
                            dns_RD: row.dns_RD || row.dns_rd || 'none',
                            dns_RA: row.dns_RA || row.dns_ra || 'none',
                            dns_rejected: row.dns_rejected || 'none',
                            http_request_body_len: parseInt(row.http_request_body_len || row.http_req_len || 0),
                            http_response_body_len: parseInt(row.http_response_body_len || row.http_resp_len || 0),
                            http_status_code: parseInt(row.http_status_code || row.http_code || 0),
                            label: 1
                          };
                          
                          const validation = preprocessNetworkData(completeRecord);
                          if (!validation.isValid) {
                            return {
                              row: actualIndex + 1,
                              status: 'error',
                              error: validation.errors.join(', '),
                              data: row
                            };
                          }
                          
                          const preprocessedData = validation.processedData;
            const prediction = await predictThreatNoEmail(preprocessedData);
                          
                          return {
                            row: actualIndex + 1,
                            status: 'completed',
                            prediction: prediction.prediction,
                            threatType: prediction.threat_type,
                            threatLevel: prediction.threat_level,
                            confidence: prediction.confidence,
                            emailSent: prediction.email_sent,
                            data: row
                          };
                        } catch (error) {
                          return {
                            row: actualIndex + 1,
                            status: 'error',
                            error: error.message,
                            data: row
                          };
                        }
                      });
                      
                      const batchResults = await Promise.all(batchPromises);
                      results.push(...batchResults);
                    }
                    
                    setProcessingProgress(100);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    const processedRecords = results.filter(r => r.status === 'completed').length;
                    const failedRecords = results.filter(r => r.status === 'error').length;
                    const threatSummary = {};
                    
                    results.forEach(result => {
                      if (result.status === 'completed' && result.threatType) {
                        threatSummary[result.threatType] = (threatSummary[result.threatType] || 0) + 1;
                      }
                    });
                    
                      const endTime = Date.now();
      const processingDuration = (endTime - startTime) / 1000;
                      
                      let userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                      if (!userInfo.email || !userInfo.name) {
                        try {
                          const currentUser = await apiService.getCurrentUser();
                          userInfo = currentUser;
                          localStorage.setItem('user', JSON.stringify(currentUser));
                        } catch (error) {
                          console.warn('Could not get current user from API:', error);
                        }
                      }
                      
                      const mlResultData = {
                        user_email: userInfo.email || "user@netaegis.com",
                        user_name: userInfo.name || "User",
        file_name: file.name,
        total_records: file.data.length,
                        processed_records: processedRecords,
                        failed_records: failedRecords,
                        threat_summary: threatSummary,
                        processing_duration: processingDuration,
                        results: results
                      };
                      
      await saveMLResults(mlResultData);
                      
                        const threatCount = Object.values(threatSummary).reduce((sum, count) => sum + count, 0);
                        const summaryData = {
                          user_email: userInfo.email || "user@netaegis.com",
                          user_name: userInfo.name || "User",
                          summary_data: {
          total_records: file.data.length,
                            threat_count: threatCount,
                            threat_types: threatSummary,
                            processing_time: processingDuration,
          file_name: file.name
                          }
                        };
                        
                        await sendCSVSummaryEmail(summaryData);
      setResultsDialog({ open: true, results, file: file });

    } catch (error) {
      console.error('Error processing file:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      alert('Failed to process file: ' + (error.response?.data?.detail || error.message));
                  } finally {
                    setIsProcessing(false);
                    setProcessingProgress(0);
                  }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Upload Threat CSV
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">ML API Status:</Typography>
          <Chip
            label={apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
            color={apiStatus === 'connected' ? 'success' : apiStatus === 'checking' ? 'warning' : 'error'}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="outlined" 
              color="info" 
              onClick={() => setColumnMappingDialog(true)}
            >
              Column Reference
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Upload Area with Tabs */}
        <Grid xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} aria-label="data input methods">
              <Tab label="CSV Upload" />
              <Tab label="JSON Data" />
              <Tab label="Manual Entry" />
            </Tabs>
            
            {/* CSV Upload Tab */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Paper 
                  {...getRootProps()} 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop the files here' : 'Drag & drop CSV/JSON files here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    or click to select files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supported formats: CSV, JSON files with network data
                  </Typography>
                </Paper>
                  </Box>
            )}
            
            {/* JSON Data Tab */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <JsonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Paste JSON Data
                </Typography>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  variant="outlined"
                  placeholder={`Paste your JSON data here. Examples:

Single record:
{
  "src_ip": "192.168.1.1",
  "src_port": 80,
  "dst_ip": "192.168.1.2",
  "dst_port": 443,
  "proto": "tcp",
  "service": "http",
  "duration": 1.5,
  "src_bytes": 1024,
  "dst_bytes": 2048,
  "conn_state": "SF"
}

Multiple records: [record1, record2, ...]`}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      // TODO: Implement JSON processing
                      alert('JSON processing will be implemented soon');
                    }}
                    disabled={!jsonData.trim()}
                    startIcon={<AddIcon />}
                  >
                    Process JSON Data
              </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setJsonData('')}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Manual Entry Tab */}
            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Manual Data Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Enter network connection details manually for single prediction
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setManualEntryDialog({ open: true, data: {} })}
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Open Manual Entry Form
                </Button>
              </Box>
            )}

            {isUploading && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Processing file...
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary">
                  {uploadProgress}% complete
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>

        {/* Upload Guidelines */}
        <Grid xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Guidelines
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon sx={{ color: '#3a2323' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="File Format" 
                    secondary="CSV files only (.csv extension)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#b71c1c' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Required Columns" 
                    secondary="27 columns including src_ip, dst_ip, proto, service, duration, etc. Download template for exact structure." 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Download sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="CSV Template" 
                    secondary="Download the official template with proper column structure and example data" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#c50e29' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="File Size" 
                    secondary="Maximum file size: 50 MB" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon sx={{ color: '#ff5252' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data Validation" 
                    secondary="Invalid data will be flagged with warnings" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current File Display */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current File
          </Typography>
          
          {uploadedFiles.map((file) => (
            <Paper key={file.id} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  {getStatusIcon(file.status)}
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {file.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {file.size} • Uploaded {file.uploadDate}
                    </Typography>
            </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={file.status} 
                    color={getStatusColor(file.status)}
                    size="small"
                  />
                  
                  {file.status === 'completed' && (
                    <>
                      <Chip 
                        label={`${file.records} records`} 
                        variant="outlined" 
                        size="small"
                      />
                      {file.errors > 0 && (
                        <Chip 
                          label={`${file.errors} errors`} 
                          color="error" 
                          size="small"
                        />
                      )}
                    </>
                  )}
                  
                  <Tooltip title="Preview Data">
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={() => handlePreviewFile(file)}
                        disabled={file.status !== 'completed'}
                      >
                        <Visibility />
                      </IconButton>
                    </span>
                  </Tooltip>
                  
                  <Tooltip title="Process with ML">
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={() => handleProcessWithML(file)}
                        disabled={file.status !== 'completed' || isProcessing}
                        color="primary"
                      >
                        <Assessment />
                      </IconButton>
                    </span>
                  </Tooltip>
                  
                  <Tooltip title="Clear File">
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteFile(file.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
              {isProcessing && file.status === 'completed' && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={processingProgress} 
                    sx={{ 
                      flexGrow: 1, 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#ff5252',
                        transition: 'transform 0.3s ease'
                      }
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 50, fontWeight: 'bold' }}>
                    {processingProgress}%
                  </Typography>
                </Box>
              )}
          </Paper>
          ))}
        </Box>
      )}

      {/* Results Dialog */}
      <Dialog 
        open={resultsDialog.open} 
        onClose={() => setResultsDialog({ open: false, results: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          ML Processing Results
        </DialogTitle>
          <DialogContent>
          {resultsDialog.results && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Processed {resultsDialog.results.length} rows
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Threat Type</TableCell>
                      <TableCell>Threat Level</TableCell>
                      <TableCell>Final Prediction</TableCell>

                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultsDialog.results.slice(0, 20).map((result, index) => (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'black', 
                            color: 'white',
                            '& .MuiTableCell-root': {
                              color: 'white'
                            },
                            '& .MuiChip-root': {
                              color: 'white',
                              backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                          }
                        }}
                      >
                        <TableCell>{result.row}</TableCell>
                        <TableCell>
                          {result.threatType ? (
                            <Chip
                              label={result.threatType}
                              color={result.threatType === 'normal' ? 'success' : 'error'}
                              size="small"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.threatLevel ? (
                            <Chip
                              label={result.threatLevel}
                              color={
                                result.threatLevel === 'Critical' ? 'error' : 
                                result.threatLevel === 'High' ? 'warning' : 
                                result.threatLevel === 'Normal' ? 'success' : 'default'
                              }
                              size="small"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.threatType 
                            ? (result.threatType === 'normal' ? 'Normal Traffic' : `${result.threatType.toUpperCase()} Attack`)
                            : result.error ? 'Error' : '-'
                          }
                        </TableCell>

                        <TableCell>
                          {result.error ? (
                            <Chip label="Error" color="error" size="small" />
                          ) : (
                            <Chip label="Success" color="success" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {resultsDialog.results.length > 20 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing first 20 results. Total processed: {resultsDialog.results.length}
                </Typography>
              )}
            </Box>
            )}
          </DialogContent>
          <DialogActions>
          <Button onClick={() => setResultsDialog({ open: false, results: null, file: null })}>
            Close
          </Button>
            {resultsDialog.results && resultsDialog.results.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setResultsDialog({ open: false, results: null, file: null });
                  navigate('/user/visualization', { state: { results: resultsDialog.results, fileMeta: resultsDialog.file } });
                }}
              >
                Visualize Results
              </Button>
            )}
          </DialogActions>
        </Dialog>

      {/* Column Mapping Reference Dialog */}
      <Dialog 
        open={columnMappingDialog} 
        onClose={() => setColumnMappingDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          📋 Column Name Reference - Supported Formats
        </DialogTitle>
        <DialogContent>
          {/* Template Download Section */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              📥 Download CSV Template
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'white' }}>
              Get the exact CSV template with proper column structure and example data for NetAegis threat detection.
            </Typography>
            <Button 
              variant="contained" 
              onClick={downloadTemplate}
              startIcon={<Download />}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Download Template (netaegis_csv_template.csv)
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'white' }}>
              Template includes: 27 columns, example data for normal traffic, DNS queries, and suspicious connections
            </Typography>
      </Paper>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            NetAegis automatically maps column names from different network monitoring tools. 
            Use any of these column names in your CSV, JSON, or manual entry.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Source IP */}
            <Grid xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🌐 Source IP Address
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> src_ip
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  source_ip, sourceip, source_address, src_addr, origin_ip, orig_h (Zeek), 
                  ip.src (Wireshark), srcip, saddr, source, from_ip, client_ip
                </Typography>
              </Paper>
            </Grid>
            
            {/* Destination IP */}
            <Grid xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🎯 Destination IP Address
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> dst_ip
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  dest_ip, destination_ip, destip, dst_addr, target_ip, resp_h (Zeek), 
                  ip.dst (Wireshark), dstip, daddr, destination, to_ip, server_ip
                </Typography>
              </Paper>
            </Grid>
            
            {/* Protocol */}
            <Grid xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📡 Protocol
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> proto
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  protocol, prot, protocol_type, ip_protocol, ip.proto (Wireshark), 
                  frame.protocols, l4_proto, transport
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                  <strong>Values:</strong> tcp, udp, icmp, igmp, ipv6, ipv6-icmp
                </Typography>
              </Paper>
            </Grid>
            
            {/* Service */}
            <Grid xs={12} sm={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🛠️ Service
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> service
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  svc, srv, service_type, application, app, protocol_service, port_service
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                  <strong>Values:</strong> http, https, ssh, ftp, dns, smtp, ssl, mysql, etc.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>💡 Pro Tips:</strong><br/>
              • Column names are case-insensitive<br/>
              • Missing columns will be filled with default values<br/>
              • The system supports data from Wireshark, Zeek/Bro, Suricata, pfSense, and many other tools<br/>
              • You can mix and match column names from different formats in the same file
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnMappingDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog 
        open={manualEntryDialog.open} 
        onClose={() => setManualEntryDialog({ open: false, data: {} })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manual Network Data Entry
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            Enter network connection details. Only Source IP and Destination IP are required - all other fields will use default values if not provided.
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Connection Info */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                🌐 Basic Connection Information
              </Typography>
            </Grid>
            
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Source IP *"
                value={manualEntryDialog.data.src_ip || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, src_ip: e.target.value }
                })}
                placeholder="192.168.1.1"
                required
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Source Port"
                type="number"
                value={manualEntryDialog.data.src_port || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, src_port: e.target.value }
                })}
                placeholder="80"
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Destination IP *"
                value={manualEntryDialog.data.dst_ip || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dst_ip: e.target.value }
                })}
                placeholder="192.168.1.2"
                required
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Destination Port"
                type="number"
                value={manualEntryDialog.data.dst_port || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dst_port: e.target.value }
                })}
                placeholder="443"
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Protocol"
                value={manualEntryDialog.data.proto || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, proto: e.target.value }
                })}
                placeholder="tcp, udp, icmp"
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Service"
                value={manualEntryDialog.data.service || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, service: e.target.value }
                })}
                placeholder="http, ssh, dns, -"
              />
            </Grid>
            
            {/* Connection Details */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🔗 Connection Details
              </Typography>
            </Grid>
            
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Duration (seconds)"
                type="number"
                value={manualEntryDialog.data.duration || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, duration: e.target.value }
                })}
                placeholder="1.5"
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                label="Connection State"
                value={manualEntryDialog.data.conn_state || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, conn_state: e.target.value }
                })}
                placeholder="SF, S0, REJ, OTH"
              />
            </Grid>
            
            {/* Data Transfer */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                📊 Data Transfer
              </Typography>
            </Grid>
            
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Source Bytes"
                type="number"
                value={manualEntryDialog.data.src_bytes || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, src_bytes: e.target.value }
                })}
                placeholder="1024"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Destination Bytes"
                type="number"
                value={manualEntryDialog.data.dst_bytes || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dst_bytes: e.target.value }
                })}
                placeholder="2048"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Missed Bytes"
                type="number"
                value={manualEntryDialog.data.missed_bytes || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, missed_bytes: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            
            {/* Packet Information */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                📦 Packet Information
              </Typography>
            </Grid>
            
            <Grid xs={3}>
              <TextField
                fullWidth
                label="Source Packets"
                type="number"
                value={manualEntryDialog.data.src_pkts || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, src_pkts: e.target.value }
                })}
                placeholder="10"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="Source IP Bytes"
                type="number"
                value={manualEntryDialog.data.src_ip_bytes || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, src_ip_bytes: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="Destination Packets"
                type="number"
                value={manualEntryDialog.data.dst_pkts || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dst_pkts: e.target.value }
                })}
                placeholder="8"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="Destination IP Bytes"
                type="number"
                value={manualEntryDialog.data.dst_ip_bytes || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dst_ip_bytes: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            
            {/* DNS Information */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🌍 DNS Information
              </Typography>
            </Grid>
            
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS Query"
                type="number"
                value={manualEntryDialog.data.dns_query || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_query: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS QClass"
                type="number"
                value={manualEntryDialog.data.dns_qclass || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_qclass: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS QType"
                type="number"
                value={manualEntryDialog.data.dns_qtype || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_qtype: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS RCode"
                type="number"
                value={manualEntryDialog.data.dns_rcode || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_rcode: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS AA"
                value={manualEntryDialog.data.dns_AA || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_AA: e.target.value }
                })}
                placeholder="none, T, F"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS RD"
                value={manualEntryDialog.data.dns_RD || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_RD: e.target.value }
                })}
                placeholder="none, T, F"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS RA"
                value={manualEntryDialog.data.dns_RA || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_RA: e.target.value }
                })}
                placeholder="none, T, F"
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="DNS Rejected"
                value={manualEntryDialog.data.dns_rejected || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, dns_rejected: e.target.value }
                })}
                placeholder="none, T, F"
              />
            </Grid>
            
            {/* HTTP Information */}
            <Grid xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🌐 HTTP Information
              </Typography>
            </Grid>
            
            <Grid xs={4}>
              <TextField
                fullWidth
                label="HTTP Request Body Length"
                type="number"
                value={manualEntryDialog.data.http_request_body_len || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, http_request_body_len: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="HTTP Response Body Length"
                type="number"
                value={manualEntryDialog.data.http_response_body_len || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, http_response_body_len: e.target.value }
                })}
                placeholder="0"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="HTTP Status Code"
                type="number"
                value={manualEntryDialog.data.http_status_code || ''}
                onChange={(e) => setManualEntryDialog({
                  ...manualEntryDialog,
                  data: { ...manualEntryDialog.data, http_status_code: e.target.value }
                })}
                placeholder="200"
              />
            </Grid>

            <Grid xs={12}>
              <Typography variant="caption" color="text.secondary">
                * Required fields. All other fields will use default values if not provided.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualEntryDialog({ open: false, data: {} })}>
            Cancel
          </Button>
          <Button 
            onClick={handleManualPrediction}
            variant="contained"
            disabled={!manualEntryDialog.data.src_ip || !manualEntryDialog.data.dst_ip}
          >
            Predict Threat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single Prediction Result Dialog */}
      <Dialog 
        open={singlePredictionDialog.open} 
        onClose={() => setSinglePredictionDialog({ open: false, result: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Threat Prediction Result
        </DialogTitle>
        <DialogContent>
          {singlePredictionDialog.result && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Detection Results
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Threat Type:
                  </Typography>
                  <Chip
                    label={singlePredictionDialog.result.threatType}
                    color={singlePredictionDialog.result.threatType === 'normal' ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Threat Level:
                  </Typography>
                  <Chip
                    label={singlePredictionDialog.result.threatLevel}
                    color={
                      singlePredictionDialog.result.threatLevel === 'Critical' ? 'error' : 
                      singlePredictionDialog.result.threatLevel === 'High' ? 'warning' : 
                      'success'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Final Assessment:
                  </Typography>
                  <Typography variant="body1">
                    {singlePredictionDialog.result.threatType === 'normal' 
                      ? 'Normal Network Traffic' 
                      : `${singlePredictionDialog.result.threatType.toUpperCase()} Attack Detected`
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSinglePredictionDialog({ open: false, result: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserCSVUpload; 