import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  CardActionArea,
  Skeleton,
  Fade
} from '@mui/material';
import {
  Security,
  People,
  CreditCard,
  Upload,
  TrendingUp,
  TrendingDown,
  Notifications,
  Visibility
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        summary: {
          totalThreats: 1247,
          activeUsers: 23,
          subscriptionPlan: 'Enterprise',
          csvUploadCount: 45
        },
        threatTrends: [
          { name: 'Jan', threats: 65 },
          { name: 'Feb', threats: 89 },
          { name: 'Mar', threats: 120 },
          { name: 'Apr', threats: 95 },
          { name: 'May', threats: 150 },
          { name: 'Jun', threats: 180 }
        ],
        threatTypes: [
          { name: 'Malware', value: 35, color: '#ff6b6b' },
          { name: 'DDoS', value: 25, color: '#4ecdc4' },
          { name: 'Phishing', value: 20, color: '#45b7d1' },
          { name: 'SQL Injection', value: 15, color: '#96ceb4' },
          { name: 'Other', value: 5, color: '#feca57' }
        ],
        recentActivity: [
          { id: 1, user: 'John Doe', action: 'Uploaded threat CSV', time: '2 minutes ago', type: 'upload' },
          { id: 2, user: 'Jane Smith', action: 'Detected new threat', time: '5 minutes ago', type: 'threat' },
          { id: 3, user: 'Mike Johnson', action: 'Generated report', time: '10 minutes ago', type: 'report' },
          { id: 4, user: 'Sarah Wilson', action: 'Added new user', time: '15 minutes ago', type: 'user' },
          { id: 5, user: 'David Brown', action: 'Updated settings', time: '20 minutes ago', type: 'settings' }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);

  const getActionIcon = (type) => {
    switch (type) {
      case 'upload': return <Upload />;
      case 'threat': return <Security />;
      case 'report': return <TrendingUp />;
      case 'user': return <People />;
      case 'settings': return <Visibility />;
      default: return <Notifications />;
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'upload': return '#4caf50';
      case 'threat': return '#f44336';
      case 'report': return '#2196f3';
      case 'user': return '#ff9800';
      case 'settings': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Fade in={!loading} timeout={700}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Admin Dashboard
        </Typography>

        {/* Summary Tiles */}
        <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
          {['totalThreats', 'activeUsers', 'subscriptionPlan', 'csvUploadCount'].map((key, idx) => (
            <Grid xs={12} md={3} key={key}>
              <CardActionArea>
                <Card
                  sx={{
                    background: [
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    ][idx],
                    color: 'white',
                    height: '100%',
                    boxShadow: 3,
                    transition: 'box-shadow 0.3s, transform 0.3s',
                    '&:hover': {
                      boxShadow: 10,
                      transform: 'translateY(-4px) scale(1.03)',
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant={key === 'subscriptionPlan' ? 'h6' : 'h4'} sx={{ fontWeight: 'bold' }}>
                          {loading || !dashboardData ? <Skeleton width={60} /> : dashboardData.summary[key]}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {key === 'totalThreats' && 'Total Threats'}
                          {key === 'activeUsers' && 'Active Users'}
                          {key === 'subscriptionPlan' && 'Subscription Plan'}
                          {key === 'csvUploadCount' && 'CSV Uploads'}
                        </Typography>
                      </Box>
                      <Fade in={!loading} timeout={900}>
                        <Box>
                          {[
                            <Security sx={{ fontSize: 40, opacity: 0.8 }} />, // totalThreats
                            <People sx={{ fontSize: 40, opacity: 0.8 }} />,   // activeUsers
                            <CreditCard sx={{ fontSize: 40, opacity: 0.8 }} />, // subscriptionPlan
                            <Upload sx={{ fontSize: 40, opacity: 0.8 }} />,   // csvUploadCount
                          ][idx]}
                        </Box>
                      </Fade>
                    </Box>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
          <Grid xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400, background: 'rgba(35,39,47,0.85)', borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom>
                Threat Detection Trends
              </Typography>
              {loading || !dashboardData ? (
                <Skeleton variant="rectangular" width="100%" height={320} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.threatTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="threats" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          <Grid xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400, background: 'rgba(35,39,47,0.85)', borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom>
                Threat Types Distribution
              </Typography>
              {loading || !dashboardData ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', my: 4 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.threatTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.threatTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
          <Grid xs={12}>
            <Paper sx={{ p: 3, background: 'rgba(35,39,47,0.85)', borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {loading || !dashboardData ? (
                <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
              ) : dashboardData.recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Notifications sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6">No recent activity</Typography>
                  <Typography variant="body2">All caught up! Recent actions will appear here.</Typography>
                </Box>
              ) : (
                <List>
                  {dashboardData.recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <Fade in timeout={500 + index * 100}>
                        <ListItem alignItems="center" sx={{
                          borderRadius: 2,
                          transition: 'background 0.2s',
                          '&:hover': { background: 'rgba(102,126,234,0.08)' }
                        }}>
                          <Tooltip title={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: getActionColor(activity.type) }}>
                                {getActionIcon(activity.type)}
                              </Avatar>
                            </ListItemAvatar>
                          </Tooltip>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight="bold">{activity.action}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{activity.user} • {activity.time}</Typography>}
                          />
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            sx={{ 
                              bgcolor: getActionColor(activity.type), 
                              color: 'white',
                              textTransform: 'capitalize'
                            }} 
                          />
                        </ListItem>
                      </Fade>
                      {index < dashboardData.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default AdminDashboard; 