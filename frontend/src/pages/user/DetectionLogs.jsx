import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Container,
  Fade,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Info,
  Refresh
} from '@mui/icons-material';
import { getMLResults } from '../../services/api';

const DetectionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserLogs();
  }, []);
  
  // Add a refresh button for debugging
  const handleRefresh = () => {
    fetchUserLogs();
  };

  const fetchUserLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in to view your detection logs.');
        return;
      }
      
      // Get current user's email to filter logs
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;
      
      console.log('Fetching logs for user:', userEmail);
      
      // Fetch ML results for the current user only
      const response = await getMLResults(userEmail, 100);
      console.log('ML results response:', response);
      setLogs(response || []);
    } catch (error) {
      console.error('Error fetching user logs:', error);
      setError(`Failed to load your detection logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={700}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth={false} sx={{ px: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Your Detection Logs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              View your personal threat detection history and analysis results
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!error && logs.length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No detection logs found. Upload and process a CSV file to see your detection logs here.
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(183,28,28,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Security sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {logs.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Files Processed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(183,28,28,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {logs.filter(log => {
                      const threatSummary = log.threat_summary || {};
                      return Object.keys(threatSummary).some(threat => threat.toLowerCase() !== 'normal');
                    }).length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Files with Threats
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(183,28,28,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {logs.filter(log => {
                      const threatSummary = log.threat_summary || {};
                      return Object.keys(threatSummary).every(threat => threat.toLowerCase() === 'normal');
                    }).length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Safe Files Only
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Logs Table */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Recent Detection History
            </Typography>
            
            {logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Info sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No detection logs found
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Upload CSV files to start generating detection logs
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Records</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Threat Summary</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {log.file_name || 'Unknown File'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          <Box>
                            <Chip 
                              label={`${log.processed_records}/${log.total_records}`}
                              color="primary"
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                            {log.failed_records > 0 && (
                              <Chip 
                                label={`${log.failed_records} failed`}
                                color="error"
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.entries(log.threat_summary || {}).slice(0, 3).map(([threat, count]) => (
                              <Chip
                                key={threat}
                                label={`${threat}: ${count}`}
                                size="small"
                                color={threat === 'normal' ? 'success' : 'error'}
                              />
                            ))}
                            {Object.keys(log.threat_summary || {}).length > 3 && (
                              <Chip
                                label={`+${Object.keys(log.threat_summary || {}).length - 3} more`}
                                size="small"
                                variant="outlined"
                                sx={{ color: 'white', borderColor: 'white' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {formatDuration(log.processing_duration)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.failed_records === 0 ? 'Completed' : 'Partial'} 
                            color={log.failed_records === 0 ? 'success' : 'warning'}
                            size="small"
                            icon={log.failed_records === 0 ? <CheckCircle /> : <Warning />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default DetectionLogs; 