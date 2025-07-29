import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import api, { testMLPrediction, checkApiHealth, predictThreat } from '../../services/api';
import { preprocessNetworkData, detectColumnMappings } from '../../utils/preprocessor';
import ReportGenerator from '../../components/ReportGenerator';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  TextareaAutosize
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete,
  Visibility,
  Download,
  Refresh,
  Add as AddIcon,
  DataObject as JsonIcon,
  Edit as EditIcon,
  Assessment
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

const CSVUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'threat_data_jan_2024.csv',
      size: '2.4 MB',
      status: 'completed',
      uploadDate: '2024-01-15 10:30',
      records: 1247,
      errors: 0,
      warnings: 3
    },
    {
      id: 2,
      name: 'network_logs_dec_2023.csv',
      size: '1.8 MB',
      status: 'processing',
      uploadDate: '2024-01-15 11:15',
      records: 0,
      errors: 0,
      warnings: 0
    },
    {
      id: 3,
      name: 'invalid_format.csv',
      size: '0.5 MB',
      status: 'error',
      uploadDate: '2024-01-15 09:45',
      records: 0,
      errors: 15,
      warnings: 0
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDialog, setPreviewDialog] = useState({ open: false, data: null });
  const [apiStatus, setApiStatus] = useState('checking');
  const [predictionResults, setPredictionResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultsDialog, setResultsDialog] = useState({ open: false, results: null });
  const [isTestingML, setIsTestingML] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [jsonData, setJsonData] = useState('');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [manualEntryDialog, setManualEntryDialog] = useState({ open: false, data: {} });
  const [singlePredictionDialog, setSinglePredictionDialog] = useState({ open: false, result: null });
  const [columnMappingDialog, setColumnMappingDialog] = useState(false);

  const navigate = useNavigate();

  // Check API status on component mount
  React.useEffect(() => {
    checkApiHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    console.log("onDrop called", acceptedFiles);
    
    // Process each file
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
    multiple: true
  });

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      let data = [];
      
      // Handle different file types
      if (file.name.endsWith('.json')) {
        // Parse JSON file
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        // Parse CSV file
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Analyze headers for column mapping
        const headerAnalysis = analyzeCSVHeaders(headers);
        
        data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
          });
          return row;
        });
        
        // Show column analysis to user
        if (headerAnalysis.missing.length > 0) {
          console.warn('Missing columns:', headerAnalysis.missing);
          console.log('Mapped columns:', headerAnalysis.mapped);
          console.log('Exact matches:', headerAnalysis.exact);
          
          // Show user-friendly message
          const mappedInfo = headerAnalysis.mapped.length > 0 
            ? `\n\nMapped columns:\n${headerAnalysis.mapped.map(m => `• "${m.detected}" → "${m.required}"`).join('\n')}`
            : '';
          
          const missingInfo = headerAnalysis.missing.length > 0
            ? `\n\nMissing columns (will use defaults):\n${headerAnalysis.missing.map(m => `• ${m}`).join('\n')}`
            : '';
          
          alert(`CSV Analysis:\n` +
            `Found ${headerAnalysis.found}/${headerAnalysis.total} required columns.` +
            mappedInfo +
            missingInfo +
            `\n\nThe system will automatically map similar column names and use default values for missing columns.`
          );
        }
      }

      console.log("Parsed file data:", data);

      // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add file to uploaded files list
          const newFile = {
            id: uploadedFiles.length + 1,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            status: 'completed',
            uploadDate: new Date().toLocaleString(),
              records: data.length,
              errors: 0,
              warnings: 0,
              data: data // Store the actual data
          };
          
          setUploadedFiles([newFile, ...uploadedFiles]);
            console.log("Uploaded files state:", [newFile, ...uploadedFiles]);
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    } catch (error) {
      console.error('Error reading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Error processing file: ' + error.message);
    }
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handlePreviewFile = (file) => {
    if (file.data) {
      setPreviewDialog({ open: true, data: file.data.slice(0, 10) });
    }
  };

  const handleProcessWithML = async (file) => {
    console.log("Process with ML clicked", file);
    if (!file.data || apiStatus !== 'connected') {
      alert('Cannot process: No data or API not connected');
      return;
    }

    setIsProcessing(true);
    const results = [];
    const processedData = []; // Store processed data for database

    try {
      // Process each row with ML
      for (let i = 0; i < file.data.length; i++) { // Process ALL rows
        const row = file.data[i];
        
        // Normalize CSV data to fill in default values (like JSON and Manual Entry)
        const completeRecord = {
          src_ip: row.src_ip || row.source_ip || row.sourceip || row.orig_h || row['ip.src'] || '',
          src_port: row.src_port || row.source_port || row.sourceport || row.orig_p || row['tcp.srcport'] || row['udp.srcport'] || 80,
          dst_ip: row.dst_ip || row.dest_ip || row.destination_ip || row.destip || row.resp_h || row['ip.dst'] || '',
          dst_port: row.dst_port || row.dest_port || row.destination_port || row.destport || row.resp_p || row['tcp.dstport'] || row['udp.dstport'] || 443,
          proto: row.proto || row.protocol || row.prot || 'tcp',
          service: row.service || row.svc || row.srv || '-',
          duration: row.duration || row.dur || row.time || 1.0,
          src_bytes: row.src_bytes || row.source_bytes || row.orig_bytes || 0,
          dst_bytes: row.dst_bytes || row.dest_bytes || row.destination_bytes || row.resp_bytes || 0,
          conn_state: row.conn_state || row.connection_state || row.state || 'SF',
          missed_bytes: row.missed_bytes || 0,
          src_pkts: row.src_pkts || row.source_packets || row.orig_pkts || 1,
          src_ip_bytes: row.src_ip_bytes || 0,
          dst_pkts: row.dst_pkts || row.dest_packets || row.destination_packets || row.resp_pkts || 1,
          dst_ip_bytes: row.dst_ip_bytes || 0,
          dns_query: row.dns_query || row.dns_q || 0,
          dns_qclass: row.dns_qclass || row.dns_qc || 0,
          dns_qtype: row.dns_qtype || row.dns_qt || 0,
          dns_rcode: row.dns_rcode || 0,
          dns_AA: row.dns_AA || row.dns_aa || 'none',
          dns_RD: row.dns_RD || row.dns_rd || 'none',
          dns_RA: row.dns_RA || row.dns_ra || 'none',
          dns_rejected: row.dns_rejected || 'none',
          http_request_body_len: row.http_request_body_len || row.http_req_len || 0,
          http_response_body_len: row.http_response_body_len || row.http_resp_len || 0,
          http_status_code: row.http_status_code || row.http_code || 0,
          label: 1  // Always 1 for threat detection prediction (ignore any label from CSV)
        };
        
        // Validate the normalized data
        const validation = preprocessNetworkData(completeRecord);
        if (!validation.isValid) {
          results.push({
            row: i + 1,
            status: 'error',
            error: validation.errors.join(', '),
            data: row
          });
          continue;
        }
        
        // Get the preprocessed data
        const preprocessedData = validation.processedData;

        try {
          const prediction = await predictThreat(preprocessedData);
          results.push({
            row: i + 1,
            status: 'completed',
            prediction: prediction.prediction,
            threatType: prediction.threat_type,
            threatLevel: prediction.threat_level,
            confidence: prediction.confidence,
            data: row
          });
          processedData.push(preprocessedData); // Store processed data for DB
        } catch (error) {
          results.push({
            row: i + 1,
            status: 'error',
            error: error.message,
            data: row
          });
        }
      }

      setResultsDialog({ open: true, results: results });

      // If processedData is not empty, send it to the backend for storage
      if (processedData.length > 0) {
        try {
          await api.post('/api/admin/store-ml-results', {
            processedData: processedData,
            fileName: file.name,
            totalRecords: file.data.length,
            processedRecords: processedData.length,
            errors: results.filter(r => r.status === 'error').length,
            warnings: results.filter(r => r.status === 'warning').length, // Assuming warnings are handled here
            uploadDate: new Date().toISOString()
          });
          console.log('Processed data stored successfully.');
        } catch (error) {
          console.error('Error storing processed data:', error);
          alert('Error storing processed data: ' + error.message);
        }
      }
      
    } catch (error) {
      console.error('ML processing error:', error);
      alert('Error processing with ML: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestML = async () => {
    setIsTestingML(true);
    try {
      const result = await testMLPrediction();
      alert(`Test successful! Prediction: ${result.prediction}, Threat Level: ${result.threat_level}`);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    } finally {
      setIsTestingML(false);
    }
  };

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

  const getFileValidationStatus = (file) => {
    if (file.status === 'error') {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          File format is invalid. Please ensure the CSV file contains the required columns: Timestamp, Source IP, Destination IP, Threat Type, Confidence.
        </Alert>
      );
    }
    
    if (file.warnings > 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {file.warnings} warnings detected. Some records may have missing or invalid data.
        </Alert>
      );
    }
    
    if (file.status === 'completed') {
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          File uploaded successfully! {file.records} records processed.
        </Alert>
      );
    }
    
    return null;
  };

  // Handle JSON data processing
  const handleJsonProcessing = async () => {
    setIsProcessing(true);
    try {
      const parsedData = JSON.parse(jsonData);
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      const results = [];
      
      // Process each record through the ML pipeline (like CSV upload)
      for (let i = 0; i < dataArray.length; i++) {
        const record = dataArray[i];
        
        // Normalize data to fill in default values (same as CSV processing)
        const completeRecord = {
          src_ip: record.src_ip || record.source_ip || record.sourceip || record.orig_h || record['ip.src'] || '',
          src_port: record.src_port || record.source_port || record.sourceport || record.orig_p || record['tcp.srcport'] || record['udp.srcport'] || 80,
          dst_ip: record.dst_ip || record.dest_ip || record.destination_ip || record.destip || record.resp_h || record['ip.dst'] || '',
          dst_port: record.dst_port || record.dest_port || record.destination_port || record.destport || record.resp_p || record['tcp.dstport'] || record['udp.dstport'] || 443,
          proto: record.proto || record.protocol || record.prot || 'tcp',
          service: record.service || record.svc || record.srv || '-',
          duration: record.duration || record.dur || record.time || 1.0,
          src_bytes: record.src_bytes || record.source_bytes || record.orig_bytes || 0,
          dst_bytes: record.dst_bytes || record.dest_bytes || record.destination_bytes || record.resp_bytes || 0,
          conn_state: record.conn_state || record.connection_state || record.state || 'SF',
          missed_bytes: record.missed_bytes || 0,
          src_pkts: record.src_pkts || record.source_packets || record.orig_pkts || 1,
          src_ip_bytes: record.src_ip_bytes || 0,
          dst_pkts: record.dst_pkts || record.dest_packets || record.destination_packets || record.resp_pkts || 1,
          dst_ip_bytes: record.dst_ip_bytes || 0,
          dns_query: record.dns_query || record.dns_q || 0,
          dns_qclass: record.dns_qclass || record.dns_qc || 0,
          dns_qtype: record.dns_qtype || record.dns_qt || 0,
          dns_rcode: record.dns_rcode || 0,
          dns_AA: record.dns_AA || record.dns_aa || 'none',
          dns_RD: record.dns_RD || record.dns_rd || 'none',
          dns_RA: record.dns_RA || record.dns_ra || 'none',
          dns_rejected: record.dns_rejected || 'none',
          http_request_body_len: record.http_request_body_len || record.http_req_len || 0,
          http_response_body_len: record.http_response_body_len || record.http_resp_len || 0,
          http_status_code: record.http_status_code || record.http_code || 0,
          label: 1  // Always 1 for threat detection prediction (ignore any label from JSON)
        };
        
        // Validate the normalized data (same as CSV)
        const validation = preprocessNetworkData(completeRecord);
        if (!validation.isValid) {
          results.push({
            row: i + 1,
            status: 'error',
            error: validation.errors.join(', '),
            data: record
          });
          continue;
        }
        
        // Get the preprocessed data and run ML prediction
        const preprocessedData = validation.processedData;

        try {
          const prediction = await predictThreat(preprocessedData);
          results.push({
            row: i + 1,
            status: 'completed',
            prediction: prediction.prediction,
            threatType: prediction.threat_type,
            threatLevel: prediction.threat_level,
            confidence: prediction.confidence,
            data: record
          });
        } catch (error) {
          results.push({
            row: i + 1,
            status: 'error',
            error: error.message,
            data: record
          });
        }
      }
      
      // Create a processed file object with ML results
      const processedFile = {
        id: uploadedFiles.length + 1,
        name: 'json_data.json',
        size: `${(jsonData.length / 1024).toFixed(1)} KB`,
        status: 'completed',
        uploadDate: new Date().toLocaleString(),
        records: dataArray.length,
        errors: results.filter(r => r.status === 'error').length,
        warnings: 0,
        data: dataArray,
        mlResults: results  // Store ML prediction results
      };
      
      setUploadedFiles([processedFile, ...uploadedFiles]);
      setJsonData('');
      
      // Show results dialog (same as CSV upload)
      setResultsDialog({ open: true, results: results });
      
    } catch (error) {
      alert('Invalid JSON format: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle single manual prediction
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
      
      const prediction = await predictThreat(validation.processedData);
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  // Analyze CSV headers and show mapping info
  const analyzeCSVHeaders = (headers) => {
    const mappings = detectColumnMappings(headers);
    const missing = Object.entries(mappings).filter(([key, value]) => value === null);
    const mapped = Object.entries(mappings).filter(([key, value]) => value !== null && value !== key);
    const exact = Object.entries(mappings).filter(([key, value]) => value === key);
    
    return {
      missing: missing.map(([key]) => key),
      mapped: mapped.map(([required, detected]) => ({ required, detected })),
      exact: exact.map(([key]) => key),
      total: Object.keys(mappings).length,
      found: Object.values(mappings).filter(v => v !== null).length
    };
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
          {/* Test Button */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleTestML}
            disabled={isTestingML}
          >
            Test ML
          </Button>
          {/* Column Mapping Help */}
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

      <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
        {/* Upload Area with Tabs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="data input methods">
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
                    Supported formats: CSV, JSON files with network data (multiple files allowed)
            </Typography>
            
            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary">
                  Selected: {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            )}
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
  "conn_state": "SF",
  "missed_bytes": 0,
  "src_pkts": 10,
  "src_ip_bytes": 1024,
  "dst_pkts": 8,
  "dst_ip_bytes": 2048,
  "dns_query": 0,
  "dns_qclass": 0,
  "dns_qtype": 0,
  "dns_rcode": 0,
  "dns_AA": "none",
  "dns_RD": "none",
  "dns_RA": "none",
  "dns_rejected": "none",
  "http_request_body_len": 0,
  "http_response_body_len": 0,
  "http_status_code": 200
}

Multiple records: [record1, record2, ...]`}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleJsonProcessing}
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

        {/* Upload Guidelines - Now parallel to upload area */}
        <Grid item xs={12} md={6}>
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

      {/* Uploaded Files List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Uploads
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
                    {file.warnings > 0 && (
                      <Chip 
                        label={`${file.warnings} warnings`} 
                        color="warning" 
                        size="small"
                      />
                    )}
                  </>
                )}
                
                <Tooltip title="Preview Data">
                  <IconButton 
                    size="small" 
                    onClick={() => handlePreviewFile(file)}
                    disabled={file.status !== 'completed'}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Process with ML">
                  <IconButton 
                    size="small" 
                    onClick={() => handleProcessWithML(file)}
                    disabled={file.status !== 'completed'}
                    color="primary"
                  >
                    <Assessment />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete File">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteFile(file.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Report Generator */}
      {showReportGenerator && (
        <Box sx={{ mt: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" gutterBottom>
              Generate Threat Analysis Report
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowReportGenerator(false)}
            >
              Close Report Generator
            </Button>
          </Box>
          <ReportGenerator 
            onReportGenerated={(reportData) => {
              setShowReportGenerator(false);
              // You can add additional logic here
            }}
            userProfile={userProfile}
          />
        </Box>
      )}

      {/* File Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          File Preview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Showing first 5 records of the uploaded file:
            </Typography>
            <Paper sx={{ overflow: 'auto', maxHeight: 400 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ backgroundColor: 'grey.100' }}>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'grey.300' }}>
                      Timestamp
                    </Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'grey.300' }}>
                      Source IP
                    </Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'grey.300' }}>
                      Destination IP
                    </Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'grey.300' }}>
                      Threat Type
                    </Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'grey.300' }}>
                      Confidence
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {previewDialog.data?.map((row, index) => (
                    <Box component="tr" key={index} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                      <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                        {row.timestamp}
                      </Box>
                      <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                        {row.sourceIP}
                      </Box>
                      <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                        {row.destIP}
                      </Box>
                      <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                        {row.threatType}
                      </Box>
                      <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                        <Chip 
                          label={row.confidence} 
                          color={row.confidence === 'High' ? 'error' : row.confidence === 'Medium' ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, data: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ML Results Dialog */}
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
                      <TableRow key={index}>
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
          <Button onClick={() => setResultsDialog({ open: false, results: null })}>
            Close
          </Button>
          {resultsDialog.results && resultsDialog.results.length > 0 && (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setResultsDialog({ open: false, results: null });
                  // Save results and fileMeta to localStorage
                  if (resultsDialog.results && resultsDialog.results.length > 0) {
                    localStorage.setItem('lastAdminResults', JSON.stringify(resultsDialog.results));
                    localStorage.setItem('lastAdminFileMeta', JSON.stringify(selectedFile));
                  }
                  navigate('/admin/threat-visualization', { state: { results: resultsDialog.results, fileMeta: selectedFile } });
                }}
              >
                Visualize Results
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Assessment />}
                onClick={() => {
                  setResultsDialog({ open: false, results: null });
                  setShowReportGenerator(true);
                }}
              >
                Generate Report
              </Button>
            </>
          )}
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                🌐 Basic Connection Information
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🔗 Connection Details
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                📊 Data Transfer
              </Typography>
            </Grid>
            
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                📦 Packet Information
              </Typography>
            </Grid>
            
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🌍 DNS Information
              </Typography>
            </Grid>
            
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                🌐 HTTP Information
              </Typography>
            </Grid>
            
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
            

            
            <Grid item xs={12}>
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
          {/* Template Download Section - Now First and Most Prominent */}
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
            
            {/* Source Port */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🔌 Source Port
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> src_port
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  source_port, sourceport, src_prt, origin_port, orig_p (Zeek), 
                  tcp.srcport (Wireshark), udp.srcport, srcport, sport, from_port, client_port
                </Typography>
              </Paper>
            </Grid>
            
            {/* Destination Port */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🚪 Destination Port
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> dst_port
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  dest_port, destination_port, destport, dst_prt, target_port, resp_p (Zeek), 
                  tcp.dstport (Wireshark), udp.dstport, dstport, dport, to_port, server_port
                </Typography>
              </Paper>
            </Grid>
            
            {/* Protocol */}
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
            
            {/* Duration */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  ⏱️ Duration
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> duration
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  time, dur, connection_time, flow_duration, session_time, elapsed, total_time
                </Typography>
              </Paper>
            </Grid>
            
            {/* Connection State */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🔗 Connection State
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> conn_state
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Supported formats:</strong><br/>
                  state, connection_state, conn_status, status, tcp_state, flow_state, session_state
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                  <strong>Values:</strong> SF, S0, REJ, RSTR, RSTO, OTH
                </Typography>
              </Paper>
            </Grid>
            
            {/* Bytes */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📊 Data Transfer (Bytes)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> src_bytes, dst_bytes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Source bytes:</strong> source_bytes, src_size, origin_bytes, orig_bytes (Zeek), 
                  client_bytes, upload_bytes, sent_bytes, tx_bytes<br/>
                  <strong>Destination bytes:</strong> destination_bytes, dest_bytes, dst_size, resp_bytes (Zeek), 
                  server_bytes, download_bytes, received_bytes, rx_bytes
                </Typography>
              </Paper>
            </Grid>
            
            {/* Packets */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📦 Packet Counts
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> src_pkts, dst_pkts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Source packets:</strong> source_packets, src_count, origin_packets, orig_pkts (Zeek), 
                  client_packets, upload_packets, sent_packets, tx_packets<br/>
                  <strong>Destination packets:</strong> destination_packets, dest_packets, dst_count, resp_pkts (Zeek), 
                  server_packets, download_packets, received_packets, rx_packets
                </Typography>
              </Paper>
            </Grid>
            
            {/* DNS Fields */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🔍 DNS Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> dns_query, dns_qclass, dns_qtype, dns_rcode, dns_AA, dns_RD, dns_RA, dns_rejected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Query:</strong> dns_q, dns.qry.name (Wireshark), query, dns_name<br/>
                  <strong>Class/Type:</strong> dns_qc, dns.qry.class, dns_qt, dns.qry.type<br/>
                  <strong>Flags:</strong> dns_aa, dns.flags.authoritative, dns_rd, dns.flags.recdesired
                </Typography>
              </Paper>
            </Grid>
            
            {/* HTTP Fields */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  🌐 HTTP Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> http_request_body_len, http_response_body_len, http_status_code
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Request:</strong> http_req_len, http_request_len, request_body_length, req_body_len<br/>
                  <strong>Response:</strong> http_resp_len, http_response_len, response_body_length, resp_body_len<br/>
                  <strong>Status:</strong> http_code, http_status, status_code, response_code
                </Typography>
              </Paper>
            </Grid>
            

            
            {/* Other Fields */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📋 Other Fields
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Required:</strong> missed_bytes, src_ip_bytes, dst_ip_bytes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Missed bytes:</strong> lost, lost_bytes, missing_bytes, dropped_bytes, retransmitted<br/>
                  <strong>IP bytes:</strong> source_ip_bytes, src_ip_size, destination_ip_bytes, dst_ip_size
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
    </Container>
  );
};

export default CSVUpload; 