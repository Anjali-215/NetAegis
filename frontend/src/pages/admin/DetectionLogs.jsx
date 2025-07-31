import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  Visibility,
  Security,
  Warning,
  Error,
  CheckCircle,
  TrendingUp,
  Delete
} from '@mui/icons-material';
import { getMLResults, deleteMLResult } from '../../services/api';

const DetectionLogs = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    threatType: 'all',
    confidence: 'all',
    status: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlResults, setMlResults] = useState([]);
  const [detailDialog, setDetailDialog] = useState({ open: false, result: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, resultId: null });

  // Load ML results from database
  useEffect(() => {
    loadMLResults();
  }, []);

  const loadMLResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMLResults();
      setMlResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.resultId) {
      return;
    }
    
    try {
      const response = await deleteMLResult(deleteDialog.resultId);
      setDeleteDialog({ open: false, resultId: null });
      loadMLResults(); // Reload the list
      alert('Detection log deleted successfully');
    } catch (err) {
      alert('Error deleting detection log: ' + err.message);
    }
  };

  const handleViewDetail = (result) => {
    setDetailDialog({ open: true, result: result });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleExportLogs = () => {
    // Simulate export functionality
    alert('Exporting detection logs...');
  };

  const handleRefreshLogs = () => {
    loadMLResults();
  };

  const getThreatTypeColor = (type) => {
    const colors = {
      'Malware': 'error', // red
      'DDoS': 'primary', // deep red
      'Phishing': 'primary', // deep red
      'SQL Injection': 'primary' // deep red
    };
    return colors[type] || 'default';
  };
  const getConfidenceColor = (confidence) => {
    const colors = {
      'High': 'error', // red
      'Medium': 'primary', // deep red
      'Low': 'default' // neutral
    };
    return colors[confidence] || 'default';
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'Blocked':
        return 'error'; // red
      case 'Detected':
        return 'primary'; // deep red
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Blocked' ? <CheckCircle /> : <Error />;
  };

  // Filter and search logic for ML results
  const filteredLogs = mlResults.filter(result => {
    const matchesSearch = 
      result.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For threat type filter, check if any threat in summary matches
    const matchesThreatType = filters.threatType === 'all' || 
      Object.keys(result.threat_summary).some(threat => 
        threat.toLowerCase().includes(filters.threatType.toLowerCase())
      );
    
    // For confidence filter, we'll use processing duration as a proxy
    const matchesConfidence = filters.confidence === 'all' || 
      (filters.confidence === 'High' && result.processing_duration > 5) ||
      (filters.confidence === 'Medium' && result.processing_duration > 2 && result.processing_duration <= 5) ||
      (filters.confidence === 'Low' && result.processing_duration <= 2);
    
    // For status filter, we'll use processed vs failed records
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'Blocked' && result.failed_records === 0) ||
      (filters.status === 'Detected' && result.failed_records > 0);
    
    return matchesSearch && matchesThreatType && matchesConfidence && matchesStatus;
  });

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Statistics
  const totalThreats = mlResults.length;
  const blockedThreats = mlResults.filter(result => result.failed_records === 0).length;
  const detectedThreats = mlResults.filter(result => result.failed_records > 0).length;
  const highConfidenceThreats = mlResults.filter(result => result.processing_duration > 5).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Detection Logs
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshLogs}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportLogs}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Export Logs
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#23272F',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalThreats}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Threats
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#23272F',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {blockedThreats}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Blocked Threats
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#23272F',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {detectedThreats}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Detected Threats
                  </Typography>
                </Box>
                <Error sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#23272F',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {highConfidenceThreats}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    High Confidence
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6">Search & Filters</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Threat Type</InputLabel>
              <Select
                value={filters.threatType}
                label="Threat Type"
                onChange={(e) => handleFilterChange('threatType', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Malware">Malware</MenuItem>
                <MenuItem value="DDoS">DDoS</MenuItem>
                <MenuItem value="Phishing">Phishing</MenuItem>
                <MenuItem value="SQL Injection">SQL Injection</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Confidence</InputLabel>
              <Select
                value={filters.confidence}
                label="Confidence"
                onChange={(e) => handleFilterChange('confidence', e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
                <MenuItem value="Detected">Detected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Box display="flex" alignItems="center" height="100%">
              <Typography variant="body2" color="text.secondary">
                {filteredLogs.length} results
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Detection Logs Table */}
      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading detection logs...
          </Typography>
        </Paper>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Paper sx={{ overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2d2d2d' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Records</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Threat Summary</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((result) => (
                  <TableRow key={result.id} hover sx={{ backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#2d2d2d' } }}>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                        {formatDate(result.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                        {result.file_name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {result.user_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cccccc' }}>
                        {result.user_email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Chip 
                          label={`${result.processed_records}/${result.total_records}`}
                          color="primary"
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        {result.failed_records > 0 && (
                          <Chip 
                            label={`${result.failed_records} failed`}
                            color="error"
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {Object.entries(result.threat_summary).slice(0, 3).map(([threat, count]) => (
                          <Chip
                            key={threat}
                            label={`${threat}: ${count}`}
                            size="small"
                            color={threat === 'normal' ? 'success' : 'error'}
                          />
                        ))}
                        {Object.keys(result.threat_summary).length > 3 && (
                          <Chip
                            label={`+${Object.keys(result.threat_summary).length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ color: 'white', borderColor: 'white' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {formatDuration(result.processing_duration)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Chip 
                        label={result.failed_records === 0 ? 'Completed' : 'Partial'} 
                        color={result.failed_records === 0 ? 'success' : 'warning'}
                        size="small"
                        icon={result.failed_records === 0 ? <CheckCircle /> : <Error />}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'white' }}>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewDetail(result)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const resultId = result.id || result._id;
                              setDeleteDialog({ open: true, resultId: resultId });
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: 'white',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: 'white'
            },
            '& .MuiTablePagination-select': {
              color: 'white'
            },
            '& .MuiTablePagination-actions': {
              color: 'white'
            }
          }}
        />

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, result: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          ML Processing Details
        </DialogTitle>
        <DialogContent>
          {detailDialog.result && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Processing Summary
                      </Typography>
                      <Typography variant="body2">
                        <strong>File:</strong> {detailDialog.result.file_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>User:</strong> {detailDialog.result.user_name} ({detailDialog.result.user_email})
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Records:</strong> {detailDialog.result.total_records}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Processed:</strong> {detailDialog.result.processed_records}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Failed:</strong> {detailDialog.result.failed_records}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {formatDuration(detailDialog.result.processing_duration)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(detailDialog.result.created_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Threat Summary
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(detailDialog.result.threat_summary).map(([threat, count]) => (
                          <Chip
                            key={threat}
                            label={`${threat}: ${count}`}
                            color={threat === 'normal' ? 'success' : 'error'}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, result: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, resultId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this detection log? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, resultId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Detection logs show ML processing results from uploaded CSV files. 
          Use the search and filter options to find specific threats or patterns.
        </Typography>
      </Alert>
    </Container>
  );
};

export default DetectionLogs; 