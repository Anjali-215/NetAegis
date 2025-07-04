import React, { useState } from 'react';
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
  InputAdornment
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
  TrendingUp
} from '@mui/icons-material';

const DetectionLogs = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    threatType: 'all',
    confidence: 'all',
    status: 'all'
  });

  // Sample detection logs data
  const detectionLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 10:30:15',
      sourceIP: '192.168.1.100',
      destinationIP: '10.0.0.1',
      threatType: 'Malware',
      confidence: 'High',
      status: 'Blocked',
      description: 'Suspicious file download detected'
    },
    {
      id: 2,
      timestamp: '2024-01-15 10:30:16',
      sourceIP: '192.168.1.101',
      destinationIP: '10.0.0.2',
      threatType: 'DDoS',
      confidence: 'Medium',
      status: 'Blocked',
      description: 'High volume traffic detected'
    },
    {
      id: 3,
      timestamp: '2024-01-15 10:30:17',
      sourceIP: '192.168.1.102',
      destinationIP: '10.0.0.3',
      threatType: 'Phishing',
      confidence: 'High',
      status: 'Detected',
      description: 'Suspicious email link detected'
    },
    {
      id: 4,
      timestamp: '2024-01-15 10:30:18',
      sourceIP: '192.168.1.103',
      destinationIP: '10.0.0.4',
      threatType: 'SQL Injection',
      confidence: 'Low',
      status: 'Blocked',
      description: 'SQL injection attempt detected'
    },
    {
      id: 5,
      timestamp: '2024-01-15 10:30:19',
      sourceIP: '192.168.1.104',
      destinationIP: '10.0.0.5',
      threatType: 'Malware',
      confidence: 'High',
      status: 'Blocked',
      description: 'Ransomware signature detected'
    },
    {
      id: 6,
      timestamp: '2024-01-15 10:30:20',
      sourceIP: '192.168.1.105',
      destinationIP: '10.0.0.6',
      threatType: 'DDoS',
      confidence: 'Medium',
      status: 'Detected',
      description: 'Distributed attack pattern detected'
    },
    {
      id: 7,
      timestamp: '2024-01-15 10:30:21',
      sourceIP: '192.168.1.106',
      destinationIP: '10.0.0.7',
      threatType: 'Phishing',
      confidence: 'High',
      status: 'Blocked',
      description: 'Fake login page detected'
    },
    {
      id: 8,
      timestamp: '2024-01-15 10:30:22',
      sourceIP: '192.168.1.107',
      destinationIP: '10.0.0.8',
      threatType: 'SQL Injection',
      confidence: 'Medium',
      status: 'Blocked',
      description: 'Database query injection attempt'
    },
    {
      id: 9,
      timestamp: '2024-01-15 10:30:23',
      sourceIP: '192.168.1.108',
      destinationIP: '10.0.0.9',
      threatType: 'Malware',
      confidence: 'Low',
      status: 'Detected',
      description: 'Suspicious executable detected'
    },
    {
      id: 10,
      timestamp: '2024-01-15 10:30:24',
      sourceIP: '192.168.1.109',
      destinationIP: '10.0.0.10',
      threatType: 'DDoS',
      confidence: 'High',
      status: 'Blocked',
      description: 'Botnet attack detected'
    }
  ];

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
    // Simulate refresh functionality
    alert('Refreshing detection logs...');
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

  // Filter and search logic
  const filteredLogs = detectionLogs.filter(log => {
    const matchesSearch = 
      log.sourceIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.destinationIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.threatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesThreatType = filters.threatType === 'all' || log.threatType === filters.threatType;
    const matchesConfidence = filters.confidence === 'all' || log.confidence === filters.confidence;
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    
    return matchesSearch && matchesThreatType && matchesConfidence && matchesStatus;
  });

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Statistics
  const totalThreats = detectionLogs.length;
  const blockedThreats = detectionLogs.filter(log => log.status === 'Blocked').length;
  const detectedThreats = detectionLogs.filter(log => log.status === 'Detected').length;
  const highConfidenceThreats = detectionLogs.filter(log => log.confidence === 'High').length;

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
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Timestamp</TableCell>
                <TableCell>Source IP</TableCell>
                <TableCell>Destination IP</TableCell>
                <TableCell>Threat Type</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {log.timestamp}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {log.sourceIP}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {log.destinationIP}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.threatType} 
                      color={getThreatTypeColor(log.threatType)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.confidence} 
                      color={getConfidenceColor(log.confidence)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.status} 
                      color={getStatusColor(log.status)}
                      size="small"
                      icon={getStatusIcon(log.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Detection logs are automatically updated every 30 seconds. 
          Use the search and filter options to find specific threats or patterns.
        </Typography>
      </Alert>
    </Container>
  );
};

export default DetectionLogs; 