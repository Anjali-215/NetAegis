import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import api, { testMLPrediction, checkApiHealth, predictThreat } from '../../services/api';
import { preprocessNetworkData } from '../../utils/preprocessor';
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
  CircularProgress
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
  Refresh
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

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

  // Check API status on component mount
  React.useEffect(() => {
    checkApiHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    console.log("onDrop called", acceptedFiles);
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Read CSV file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return row;
      });

      console.log("Parsed CSV data:", data);

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

    try {
      // Process each row with ML
      for (let i = 0; i < Math.min(file.data.length, 50); i++) { // Limit to 50 rows for demo
        const row = file.data[i];
        
        // Validate the data first
        const validation = preprocessNetworkData(row);
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
        </Box>
      </Box>

      <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
        {/* Upload Area */}
        <Grid item xs={12} md={6}>
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
              {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to select a file
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported format: CSV files with threat data
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

          {isUploading && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading file...
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary">
                {uploadProgress}% complete
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Upload Guidelines */}
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
                    secondary="Timestamp, Source IP, Destination IP, Threat Type, Confidence" 
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
                    <Visibility sx={{ color: '#ff5252' }} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Process with ML">
                  <IconButton 
                    size="small" 
                    onClick={() => handleProcessWithML(file)}
                    disabled={file.status !== 'completed' || apiStatus !== 'connected' || isProcessing}
                  >
                    {isProcessing ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Refresh sx={{ color: '#ff5252' }} />
                    )}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Download">
                  <IconButton size="small" disabled={file.status !== 'completed'}>
                    <Download sx={{ color: '#ff5252' }} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteFile(file.id)}
                    color="error"
                  >
                    <Delete sx={{ color: '#ff5252' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {getFileValidationStatus(file)}
          </Paper>
        ))}
      </Box>

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
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CSVUpload; 