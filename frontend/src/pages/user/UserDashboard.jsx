import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
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
  Fade,
  Container
} from '@mui/material';
import {
  Security,
  CreditCard,
  Upload,
  TrendingUp,
  Notifications
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        summary: {
          totalThreats: 1247,
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
          { name: 'Malware', value: 35, color: '#b71c1c' },
          { name: 'DDoS', value: 25, color: '#ff5252' },
          { name: 'Phishing', value: 20, color: '#c50e29' },
          { name: 'SQL Injection', value: 15, color: '#7f0000' },
          { name: 'Other', value: 5, color: '#3a2323' }
        ]
      });
      setLoading(false);
    }, 1200);
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
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4, 
              background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            User Dashboard
          </Typography>

          {/* Summary Tiles */}
          <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
            {['totalThreats', 'csvUploadCount'].map((key, idx) => (
              <Grid xs={12} md={6} key={key}>
                <CardActionArea>
                  <Card
                    sx={{
                      background: [
                        'linear-gradient(135deg, #7f0000 0%, #b71c1c 100%)',
                        'linear-gradient(135deg, #b71c1c 0%, #ff867f 100%)',
                      ][idx],
                      color: 'white',
                      height: '100%',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                        transform: 'translateY(-8px) scale(1.02)',
                        color: '#fff',
                        '& .MuiSvgIcon-root': {
                          color: '#fff',
                          filter: 'drop-shadow(0 0 6px #b71c1c)'
                        }
                      },
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {loading || !dashboardData ? <Skeleton width={60} /> : dashboardData.summary[key]}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            {key === 'totalThreats' && 'Total Threats'}
                            {key === 'csvUploadCount' && 'CSV Uploads'}
                          </Typography>
                        </Box>
                        <Fade in={!loading} timeout={900}>
                          <Box>
                            {[
                              <Security sx={{ fontSize: 48, opacity: 0.8 }} />, // totalThreats
                              <Upload sx={{ fontSize: 48, opacity: 0.8 }} />,   // csvUploadCount
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
              <Paper sx={{ 
                p: 4, 
                height: 450, 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
                borderRadius: 3, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Threat Detection Trends
                </Typography>
                {loading || !dashboardData ? (
                  <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 2 }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.threatTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                      <YAxis stroke="rgba(255,255,255,0.7)" />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 8
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="#b71c1c" 
                        strokeWidth={4}
                        dot={{ fill: '#b71c1c', strokeWidth: 3, r: 8 }}
                        activeDot={{ r: 12, stroke: '#ff5252', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid xs={12} md={4}>
              <Paper sx={{ 
                p: 4, 
                height: 450, 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
                borderRadius: 3, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Threat Types Distribution
                </Typography>
                {loading || !dashboardData ? (
                  <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto', my: 4 }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.threatTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.threatTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 8
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserDashboard; 