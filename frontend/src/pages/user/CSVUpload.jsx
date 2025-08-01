import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import api, { predictThreat, checkApiHealth, saveMLResults } from '../../services/api';
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
  Grid,
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
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import apiService from '../../services/api';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const UserCSVUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResults, setPredictionResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [resultsDialog, setResultsDialog] = useState({ open: false, results: null });
  const [fileMeta, setFileMeta] = useState(null); // {name, size, uploadTime, recordCount}
  const [processingProgress, setProcessingProgress] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    checkApiHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

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

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSelectedFile(file);
    setPredictionResults([]);
    // Parse file for record count
    let recordCount = 0;
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
      recordCount = data.length;
    } catch (err) {
      recordCount = 0;
    }
    setFileMeta({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      uploadTime: dayjs().format('M/D/YYYY, h:mm:ss A'),
      recordCount
    });
    setUploadProgress(100);
    setIsUploading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Upload Network Traffic CSV
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Upload a CSV file to detect and predict threats using the ML model. Only you can see the results of your upload.
        </Typography>
        <Box {...getRootProps()} sx={{ border: '2px dashed #b71c1c', borderRadius: 2, p: 4, textAlign: 'center', background: isDragActive ? 'rgba(183,28,28,0.08)' : 'inherit', cursor: 'pointer', mb: 3 }}>
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: '#b71c1c', mb: 1 }} />
          <Typography variant="h6" color="#b71c1c">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a CSV file here, or click to select'}
          </Typography>
        </Box>
        {isUploading && (
          <Box sx={{ my: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary">Uploading...</Typography>
          </Box>
        )}
        {/* Uploaded file bar with process button below upload area */}
        {selectedFile && fileMeta && !isUploading && (
          <Paper sx={{ display: 'flex', alignItems: 'center', p: 2, mt: 4, background: '#181818', borderRadius: 2, boxShadow: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#ff5252">
                {fileMeta.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fileMeta.size} MB • Uploaded {fileMeta.uploadTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fileMeta.recordCount} records
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="ready" color="success" sx={{ mr: 2 }} />
              {isProcessing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 250 }}>
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
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  setIsProcessing(true);
                  setProcessingProgress(0); // Start at 0%
                  const startTime = Date.now(); // Track processing start time
                  try {
                    const text = await selectedFile.text();
                    let data = [];
                    if (selectedFile.name.endsWith('.json')) {
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
                    
                    const results = [];
                    const batchSize = 2; // Process in smaller batches for better progress tracking
                    
                    for (let i = 0; i < data.length; i += batchSize) {
                      const batch = data.slice(i, i + batchSize);
                      
                      // Update progress at start of batch
                      const progress = Math.round((i / data.length) * 100);
                      setProcessingProgress(progress);
                      
                      // Process batch in parallel
                      const batchPromises = batch.map(async (row, batchIndex) => {
                        const actualIndex = i + batchIndex;
                        
                        try {
                          // Normalize and fill defaults
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
                          
                          // Validate
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
                          
                          // Get user info from localStorage
                          const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                          const prediction = await predictThreat(
                            preprocessedData, 
                            userInfo.email || null, 
                            userInfo.name || null
                          );
                          
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
                      
                      // Wait for batch to complete
                      const batchResults = await Promise.all(batchPromises);
                      results.push(...batchResults);
                      
                      // Update progress after batch completion
                      const batchProgress = Math.round(((i + batchSize) / data.length) * 100);
                      setProcessingProgress(Math.min(batchProgress, 95)); // Keep at 95% until final completion
                      
                      // Add a small delay to make progress visible
                      await new Promise(resolve => setTimeout(resolve, 100));
                      
                      // Update progress (optional - you can add a progress bar)
                      console.log(`Processed ${Math.min(i + batchSize, data.length)} of ${data.length} records`);
                    }
                    
                    setProcessingProgress(100);
                    
                    // Add a small delay to show 100% completion
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // Calculate processing statistics
                    const processedRecords = results.filter(r => r.status === 'completed').length;
                    const failedRecords = results.filter(r => r.status === 'error').length;
                    const threatSummary = {};
                    
                    // Count threat types
                    results.forEach(result => {
                      if (result.status === 'completed' && result.threatType) {
                        threatSummary[result.threatType] = (threatSummary[result.threatType] || 0) + 1;
                      }
                    });
                    
                    // Save results to database
                    try {
                      const endTime = Date.now();
                      const processingDuration = (endTime - startTime) / 1000; // Convert to seconds
                      
                      // Get user info from localStorage or API
                      let userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                      
                      // If no user info in localStorage, try to get from API
                      if (!userInfo.email || !userInfo.name) {
                        try {
                          const currentUser = await apiService.getCurrentUser();
                          userInfo = currentUser;
                          // Store the user info for future use
                          localStorage.setItem('user', JSON.stringify(currentUser));
                        } catch (error) {
                          console.warn('Could not get current user from API:', error);
                        }
                      }
                      
                      const mlResultData = {
                        user_email: userInfo.email || "user@netaegis.com",
                        user_name: userInfo.name || "User",
                        file_name: selectedFile.name,
                        total_records: data.length,
                        processed_records: processedRecords,
                        failed_records: failedRecords,
                        threat_summary: threatSummary,
                        processing_duration: processingDuration,
                        results: results
                      };
                      
                      const savedResult = await saveMLResults(mlResultData);
                      console.log('ML results saved to database:', savedResult);
                      
                      // Show success message
                      alert(`ML processing completed! Results saved to database.\n\nProcessed: ${processedRecords} records\nFailed: ${failedRecords} records\nDuration: ${processingDuration.toFixed(2)} seconds`);
                      
                    } catch (dbError) {
                      console.error('Error saving to database:', dbError);
                      alert('ML processing completed, but failed to save to database: ' + dbError.message);
                    }
                    
                    setResultsDialog({ open: true, results });
                  } catch (err) {
                    console.error('Processing error:', err);
                    alert('Failed to process file: ' + err.message);
                  } finally {
                    setIsProcessing(false);
                    setProcessingProgress(0);
                  }
                }}
                disabled={isProcessing || apiStatus !== 'connected'}
                sx={{ 
                  minWidth: 180, 
                  fontWeight: 'bold',
                  opacity: isProcessing ? 0.7 : 1
                }}
              >
                {isProcessing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <span>Processing...</span>
                  </Box>
                ) : (
                  'Process with ML'
                )}
              </Button>
              

            </Box>
          </Paper>
        )}
        {/* End uploaded file bar */}
        <Dialog open={resultsDialog.open} onClose={() => setResultsDialog({ open: false, results: null })} maxWidth="md" fullWidth>
          <DialogTitle>Prediction Results</DialogTitle>
          <DialogContent>
            {!resultsDialog.results || resultsDialog.results.length === 0 ? (
              <Typography>No threats detected in the uploaded file.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Prediction</TableCell>
                      <TableCell>Threat Type</TableCell>
                      <TableCell>Threat Level</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Email Alert</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultsDialog.results.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.row}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.prediction !== undefined ? row.prediction : '-'}</TableCell>
                        <TableCell>{row.threatType || '-'}</TableCell>
                        <TableCell>{row.threatLevel || '-'}</TableCell>
                        <TableCell>{row.confidence !== undefined ? row.confidence : '-'}</TableCell>
                        <TableCell>
                          {row.threatType && row.threatType !== 'normal' ? (
                            row.emailSent ? (
                              <Chip label="Sent" color="success" size="small" />
                            ) : (
                              <Chip label="Failed" color="error" size="small" />
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell style={{ color: row.status === 'error' ? 'red' : undefined }}>{row.error || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultsDialog({ open: false, results: null })} color="primary">Close</Button>
            {resultsDialog.results && resultsDialog.results.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setResultsDialog({ open: false, results: null });
                  navigate('/user/visualization', { state: { results: resultsDialog.results, fileMeta } });
                }}
              >
                Visualize Results
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserCSVUpload; 