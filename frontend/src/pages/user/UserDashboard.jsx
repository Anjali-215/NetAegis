import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  Fade
} from '@mui/material';
import {
  Security,
  Upload,
  Assessment,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage or API
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userInfo);
    setLoading(false);
  }, []);

  return (
    <Fade in={!loading} timeout={700}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth={false} sx={{ px: 0 }}>
          {/* Welcome Header */}
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
              Welcome, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your personal security dashboard
            </Typography>
          </Box>

          {/* Summary Tiles */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} md={6}>
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
                  <Upload sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    0
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Files Uploaded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
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
                    0
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Threats Detected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3, 
            mb: 4,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Upload CSV files for threat analysis
                </Typography>
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  View threat visualizations and reports
                </Typography>
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Manage your profile and settings
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Activity Summary */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No recent activity to display
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserDashboard; 