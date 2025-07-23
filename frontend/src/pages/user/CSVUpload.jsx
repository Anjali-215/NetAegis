import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import api, { predictThreat, checkApiHealth } from '../../services/api';
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
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  setIsProcessing(true);
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
                    for (let i = 0; i < data.length; i++) {
                      const row = data[i];
                      // Normalize and fill defaults like admin
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
                        label: 1
                      };
                      // Validate
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
                      } catch (error) {
                        results.push({
                          row: i + 1,
                          status: 'error',
                          error: error.message,
                          data: row
                        });
                      }
                    }
                    setResultsDialog({ open: true, results });
                  } catch (err) {
                    alert('Failed to process file: ' + err.message);
                  }
                  setIsProcessing(false);
                }}
                disabled={isProcessing || apiStatus !== 'connected'}
                sx={{ minWidth: 180, fontWeight: 'bold' }}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Process with ML'}
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