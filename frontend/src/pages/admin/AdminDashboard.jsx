import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Security,
  Assessment,
  CheckCircle,
  Warning,
  Error,
  Schedule
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalThreats: 0,
    reportsGenerated: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);
  const [userCompany, setUserCompany] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // First, get current user's company
      const currentUserResponse = await fetch('http://localhost:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!currentUserResponse.ok) {
        setError('Failed to get user information');
        return;
      }

      const currentUser = await currentUserResponse.json();
      const company = currentUser.company;

      if (!company) {
        setError('Company information not available');
        return;
      }

      setUserCompany(company);

      // Fetch only the data we need
      const [threatsResponse, activitiesResponse] = await Promise.allSettled([
        fetch('http://localhost:8000/ml-results', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let totalThreats = 0;
      let reportsGenerated = 0;
      let threatsData = [];
      let activitiesData = [];

      // Process threats data - filter by company
      if (threatsResponse.status === 'fulfilled' && threatsResponse.value.ok) {
        threatsData = await threatsResponse.value.json();
        const companyThreats = threatsData.filter(threat => threat.company === company);
        totalThreats = companyThreats.length || 0;
      }

      // Process activities (notifications) - filter by company
      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.ok) {
        activitiesData = await activitiesResponse.value.json();
        const companyActivities = activitiesData.filter(activity => activity.company === company);
        reportsGenerated = companyActivities.length || 0;
      } else {
        // Fallback: use threats count as reports if notifications endpoint fails
        reportsGenerated = totalThreats;
      }

      setDashboardData({
        totalThreats,
        reportsGenerated
      });

      // Generate recent activities from the company-specific data
      const activities = [];
      
      if (threatsData.length > 0) {
        const companyThreats = threatsData.filter(threat => threat.company === company);
        companyThreats.slice(0, 3).forEach(threat => {
          activities.push({
            id: threat._id,
            type: 'threat',
            title: `Threat detected in ${threat.filename || 'uploaded file'}`,
            description: `Threat level: ${threat.threat_level || 'Unknown'}`,
            timestamp: new Date(threat.created_at || Date.now()),
            severity: threat.threat_level === 'Critical' ? 'error' : threat.threat_level === 'High' ? 'warning' : 'info'
          });
        });
      }

      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to fetch dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and set up auto-refresh
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#4caf50';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <CheckCircle />;
      default: return <CheckCircle />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: '#b71c1c' }} />
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
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to NetAegis Administration Panel
            </Typography>
            {userCompany && (
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                Company: {userCompany}
              </Typography>
            )}
            
            {error && (
              <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          {/* Quick Stats */}
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
                  <Security sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {dashboardData.totalThreats}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Threats
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
                  <Assessment sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {dashboardData.reportsGenerated}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Reports Generated
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>



          {/* Recent Activity */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Recent Activity
            </Typography>
            {recentActivities.length > 0 ? (
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <ListItemIcon sx={{ color: getSeverityColor(activity.severity) }}>
                      {getSeverityIcon(activity.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                            {activity.title}
                          </Typography>
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            sx={{ 
                              bgcolor: getSeverityColor(activity.severity),
                              color: 'white',
                              fontSize: '0.7rem'
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent activity to display
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default AdminDashboard;
