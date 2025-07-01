import React, { useState, useCallback } from 'react';
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
  TextField
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Warning,
  Info,
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

  const onDrop = useCallback((acceptedFiles) => {
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

    // Simulate file upload progress
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
            records: Math.floor(Math.random() * 1000) + 100,
            errors: Math.floor(Math.random() * 5),
            warnings: Math.floor(Math.random() * 10)
          };
          
          setUploadedFiles([newFile, ...uploadedFiles]);
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handlePreviewFile = (file) => {
    // Simulate file preview data
    const previewData = [
      { timestamp: '2024-01-15 10:30:15', sourceIP: '192.168.1.100', destIP: '10.0.0.1', threatType: 'Malware', confidence: 'High' },
      { timestamp: '2024-01-15 10:30:16', sourceIP: '192.168.1.101', destIP: '10.0.0.2', threatType: 'DDoS', confidence: 'Medium' },
      { timestamp: '2024-01-15 10:30:17', sourceIP: '192.168.1.102', destIP: '10.0.0.3', threatType: 'Phishing', confidence: 'High' },
      { timestamp: '2024-01-15 10:30:18', sourceIP: '192.168.1.103', destIP: '10.0.0.4', threatType: 'SQL Injection', confidence: 'Low' },
      { timestamp: '2024-01-15 10:30:19', sourceIP: '192.168.1.104', destIP: '10.0.0.5', threatType: 'Malware', confidence: 'High' }
    ];
    
    setPreviewDialog({ open: true, data: previewData });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Info color="info" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'warning';
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Upload Threat CSV
      </Typography>

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
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
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
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="File Format" 
                    secondary="CSV files only (.csv extension)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Required Columns" 
                    secondary="Timestamp, Source IP, Destination IP, Threat Type, Confidence" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="File Size" 
                    secondary="Maximum file size: 50 MB" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Error color="error" />
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
                
                <Tooltip title="Download">
                  <IconButton size="small" disabled={file.status !== 'completed'}>
                    <Download />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
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
    </Container>
  );
};

export default CSVUpload; 