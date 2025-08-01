import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Container,
  Fade,
  Button,
  Chip
} from '@mui/material';
import {
  Assessment,
  Security,
  TrendingUp,
  Download,
  Visibility
} from '@mui/icons-material';

const UserReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Mock reports for the current user
    const mockReports = [
      {
        id: 1,
        title: 'Network Security Analysis',
        description: 'Comprehensive analysis of your network traffic patterns and threat detection results.',
        type: 'security',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        metrics: {
          totalConnections: 1250,
          threatsDetected: 3,
          accuracy: 94.2
        }
      },
      {
        id: 2,
        title: 'Threat Detection Summary',
        description: 'Monthly summary of detected threats and security recommendations.',
        type: 'summary',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        metrics: {
          totalConnections: 890,
          threatsDetected: 1,
          accuracy: 96.8
        }
      }
    ];
    setReports(mockReports);
  }, []);

  const getReportIcon = (type) => {
    switch (type) {
      case 'security':
        return <Security sx={{ color: '#b71c1c' }} />;
      case 'summary':
        return <Assessment sx={{ color: '#2196f3' }} />;
      default:
        return <TrendingUp sx={{ color: '#4caf50' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
              Your Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              View and download your personal security analysis reports
            </Typography>
          </Box>

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
                  <Assessment sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {reports.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Reports
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
                  <Security sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {reports.reduce((sum, report) => sum + report.metrics.threatsDetected, 0)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Threats Detected
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
                  <TrendingUp sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {reports.length > 0 ? 
                      (reports.reduce((sum, report) => sum + report.metrics.accuracy, 0) / reports.length).toFixed(1) : 0
                    }%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Avg. Accuracy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Reports List */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Recent Reports
            </Typography>
            
            {reports.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assessment sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No reports available
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Generate reports by analyzing your network data
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {reports.map((report) => (
                  <Grid xs={12} md={6} key={report.id}>
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
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getReportIcon(report.type)}
                          <Box sx={{ ml: 2, flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                              {report.title}
                            </Typography>
                            <Chip 
                              label={report.status} 
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {report.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Generated: {formatDate(report.date)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label={`${report.metrics.totalConnections} connections`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            label={`${report.metrics.threatsDetected} threats`}
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                          <Chip 
                            label={`${report.metrics.accuracy}% accuracy`}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            sx={{
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              '&:hover': {
                                borderColor: '#b71c1c',
                                backgroundColor: 'rgba(183,28,28,0.1)'
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            sx={{
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              '&:hover': {
                                borderColor: '#b71c1c',
                                backgroundColor: 'rgba(183,28,28,0.1)'
                              }
                            }}
                          >
                            Download
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserReports; 