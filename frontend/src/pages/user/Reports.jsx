import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Grid, Container, Fade, Button, Chip,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Alert,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import {
  Assessment, Security, TrendingUp, People, Warning, CheckCircle, Refresh
} from '@mui/icons-material';
import { getMLResults, adminListUsers } from '../../services/api';

const UserReports = () => {
  const [reportType, setReportType] = useState('threat_summary');
  const [dateRange, setDateRange] = useState('30');
  const [threatTypeFilter, setThreatTypeFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [threatData, setThreatData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reportType === 'threat_summary') {
      fetchThreatData();
    } else if (reportType === 'user_activity') {
      fetchUserData();
    }
  }, [reportType, dateRange, threatTypeFilter]);

  const fetchThreatData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMLResults();
      
      if (response && response.results) {
        const endDate = new Date();
        let startDate;
        
        switch (dateRange) {
          case '7': startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); break;
          case '30': startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); break;
          case '90': startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); break;
          case '365': startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); break;
          default: startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const filteredResults = response.results.filter(result => {
          const resultDate = new Date(result.created_at);
          return resultDate >= startDate && resultDate <= endDate;
        });

        const threats = [];
        filteredResults.forEach(result => {
          if (result.processed_data) {
            result.processed_data.forEach(record => {
              if (record.label === 1) {
                const threat = {
                  id: `${result._id}_${record.id || Math.random()}`,
                  timestamp: result.created_at,
                  fileName: result.file_name,
                  threatType: determineThreatType(record),
                  severity: determineSeverity(record),
                  confidence: calculateConfidence(record),
                  sourceIP: record.src_ip || 'N/A',
                  destIP: record.dst_ip || 'N/A',
                  protocol: record.proto || 'tcp',
                  service: record.service || '-',
                  duration: record.duration || 0,
                  srcBytes: record.src_bytes || 0,
                  dstBytes: record.dst_bytes || 0,
                  srcPkts: record.src_pkts || 0,
                  dstPkts: record.dst_pkts || 0
                };
                threats.push(threat);
              }
            });
          }
        });

        let filteredThreats = threats;
        if (threatTypeFilter !== 'all') {
          filteredThreats = threats.filter(threat => 
            threat.threatType.toLowerCase().includes(threatTypeFilter.toLowerCase())
          );
        }

        setThreatData(filteredThreats);
      }
    } catch (err) {
      setError('Failed to fetch threat data: ' + err.message);
      console.error('Error fetching threat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminListUsers();
      
      if (response) {
        const endDate = new Date();
        let startDate;
        
        switch (dateRange) {
          case '7': startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); break;
          case '30': startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); break;
          case '90': startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); break;
          case '365': startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); break;
          default: startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const filteredUsers = response.filter(user => {
          if (user.created_at) {
            const userDate = new Date(user.created_at);
            return userDate >= startDate && userDate <= endDate;
          }
          return true;
        });

        setUserData(filteredUsers);
      }
    } catch (err) {
      setError('Failed to fetch user data: ' + err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const determineThreatType = (record) => {
    if (record.duration > 100 && record.src_bytes > 1000000) return 'DDoS Attack';
    if (record.src_bytes > 1000000) return 'Data Exfiltration';
    if (record.duration > 1000) return 'Suspicious Connection';
    if (record.src_pkts > 100) return 'Port Scanning';
    return 'Network Anomaly';
  };

  const determineSeverity = (record) => {
    if (record.duration > 1000 || record.src_bytes > 1000000) return 'High';
    if (record.duration > 100 || record.src_bytes > 100000) return 'Medium';
    return 'Low';
  };

  const calculateConfidence = (record) => {
    let confidence = 70;
    if (record.duration > 100) confidence += 10;
    if (record.src_bytes > 100000) confidence += 10;
    if (record.src_pkts > 50) confidence += 10;
    return Math.min(confidence, 95);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getThreatTypeIcon = (threatType) => {
    if (threatType.includes('DDoS')) return <Security sx={{ color: '#f44336' }} />;
    if (threatType.includes('Data')) return <TrendingUp sx={{ color: '#ff9800' }} />;
    if (threatType.includes('Scanning')) return <Assessment sx={{ color: '#2196f3' }} />;
    return <Warning sx={{ color: '#ff9800' }} />;
  };

  const maskPassword = (password) => {
    if (!password) return 'N/A';
    return '*'.repeat(Math.min(password.length, 8));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setReportGenerated(true);
      setError('');
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSummaryStats = () => {
    if (reportType === 'threat_summary') {
      const totalThreats = threatData.length;
      const highSeverity = threatData.filter(t => t.severity === 'High').length;
      const avgConfidence = totalThreats > 0 
        ? (threatData.reduce((sum, t) => sum + t.confidence, 0) / totalThreats).toFixed(1)
        : 0;
      return { totalThreats, highSeverity, avgConfidence };
    } else {
      const totalUsers = userData.length;
      const activeUsers = userData.filter(u => u.is_active).length;
      const newUsers = userData.filter(u => {
        if (!u.created_at) return false;
        const userDate = new Date(u.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return userDate >= weekAgo;
      }).length;
      return { totalUsers, activeUsers, newUsers };
    }
  };

  const stats = getSummaryStats();

  return (
    <Fade in={true} timeout={700}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth={false} sx={{ px: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Generate New Report
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create comprehensive reports based on your data
            </Typography>
          </Box>

          {/* Warning Banner */}
          <Alert severity="warning" sx={{ mb: 4, background: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
            Reports are generated from your existing ML analysis data. Upload and process CSV files in the CSV Upload section to see results here.
          </Alert>

          {/* Report Configuration Form */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, p: 3, border: '1px solid rgba(255,255,255,0.1)', mb: 4
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Report Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'text.secondary' }}>Report Type</InputLabel>
                  <Select value={reportType} onChange={(e) => setReportType(e.target.value)} sx={{ color: 'white' }}>
                    <MenuItem value="threat_summary">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 1, color: '#b71c1c' }} />
                        Threat Summary Report
                      </Box>
                    </MenuItem>
                    <MenuItem value="user_activity">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, color: '#2196f3' }} />
                        User Activity Report
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'text.secondary' }}>Date Range</InputLabel>
                  <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} sx={{ color: 'white' }}>
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                    <MenuItem value="365">Last 365 days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {reportType === 'threat_summary' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'text.secondary' }}>Threat Type Filter</InputLabel>
                    <Select value={threatTypeFilter} onChange={(e) => setThreatTypeFilter(e.target.value)} sx={{ color: 'white' }}>
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="ddos">DDoS Attacks</MenuItem>
                      <MenuItem value="scanning">Port Scanning</MenuItem>
                      <MenuItem value="data">Data Exfiltration</MenuItem>
                      <MenuItem value="anomaly">Network Anomalies</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'text.secondary' }}>Export Format</InputLabel>
                  <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} sx={{ color: 'white' }}>
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                    <MenuItem value="json">JSON File</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Checkbox checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} sx={{ color: '#b71c1c' }} />}
                  label="Include Charts & Visualizations"
                  sx={{ color: 'text.secondary' }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Checkbox checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} sx={{ color: '#b71c1c' }} />}
                  label="Include Detailed Data"
                  sx={{ color: 'text.secondary' }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={generateReport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                sx={{
                  background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                  color: 'white', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8e0000 0%, #d32f2f 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(183,28,28,0.4)'
                  }
                }}
              >
                {loading ? 'GENERATING...' : 'GENERATE REPORT'}
              </Button>
            </Box>
          </Paper>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {reportType === 'threat_summary' ? (
              <>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(183,28,28,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Security sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.totalThreats}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">Total Threats Detected</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(255,152,0,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Warning sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.highSeverity}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">High Severity Threats</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(76,175,80,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.avgConfidence}%
                      </Typography>
                      <Typography variant="body1" color="text.secondary">Avg. Detection Confidence</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            ) : (
              <>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(33,150,243,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <People sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">Total Users</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(76,175,80,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.activeUsers}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">Active Users</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(255,152,0,0.4)' }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stats.newUsers}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">New Users (7 days)</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>

          {/* Data Display */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, p: 3, border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                {reportType === 'threat_summary' ? 'Threat Detection Data' : 'User Activity Data'}
              </Typography>
              <IconButton onClick={reportType === 'threat_summary' ? fetchThreatData : fetchUserData} sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#b71c1c' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading data...</Typography>
              </Box>
            ) : reportType === 'threat_summary' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Threat Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Severity</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confidence</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Source IP</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Destination IP</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Protocol</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {threatData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          No threats detected in the selected time range
                        </TableCell>
                      </TableRow>
                    ) : (
                      threatData.map((threat) => (
                        <TableRow key={threat.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getThreatTypeIcon(threat.threatType)}
                              <Typography sx={{ ml: 1, color: 'white' }}>{threat.threatType}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={threat.severity} color={getSeverityColor(threat.severity)} size="small" />
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>{threat.confidence}%</TableCell>
                          <TableCell sx={{ color: 'white' }}>{threat.sourceIP}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{threat.destIP}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{threat.protocol}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{formatDate(threat.timestamp)}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{threat.fileName}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Password</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          No users found in the selected time range
                        </TableCell>
                      </TableRow>
                    ) : (
                      userData.map((user) => (
                        <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                          <TableCell sx={{ color: 'white' }}>{user.name || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{user.email || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{user.company || 'N/A'}</TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            <Chip label={user.role || 'user'} color={user.role === 'admin' ? 'error' : 'default'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'warning'} size="small" />
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>{formatDate(user.created_at)}</TableCell>
                          <TableCell sx={{ color: 'white' }}>{maskPassword(user.password)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Success Message */}
          {reportGenerated && (
            <Alert severity="success" sx={{ mt: 3, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
              Report generated successfully! You can now download it in the selected format.
            </Alert>
          )}
        </Container>
      </Box>
    </Fade>
  );
};

export default UserReports;
