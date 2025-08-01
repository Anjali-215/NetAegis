import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Container,
  Fade,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Notifications,
  Security,
  Warning,
  Info,
  CheckCircle,
  Error
} from '@mui/icons-material';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications for the current user
    // In a real app, this would fetch from an API
    const mockNotifications = [
      {
        id: 1,
        type: 'threat',
        title: 'Threat Detected',
        message: 'A DDoS attack was detected in your uploaded network data.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: 2,
        type: 'success',
        title: 'Analysis Complete',
        message: 'Your CSV file has been successfully analyzed.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true
      },
      {
        id: 3,
        type: 'info',
        title: 'System Update',
        message: 'New threat detection models have been deployed.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'threat':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'success':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'error':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <Info sx={{ color: '#2196f3' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'threat':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              Your Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Stay updated with your personal security alerts and system notifications
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
                  <Notifications sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {notifications.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Notifications
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
                    {unreadCount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Unread Notifications
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
                  <Security sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    {notifications.filter(n => n.type === 'threat').length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Security Alerts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Notifications List */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              Recent Notifications
            </Typography>
            
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Info sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications to display
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  You'll receive notifications for important security events
                </Typography>
              </Box>
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{
                      backgroundColor: notification.read ? 'transparent' : 'rgba(183,28,28,0.1)',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }
                    }}>
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ 
                              color: 'white', 
                              fontWeight: notification.read ? 'normal' : 'bold' 
                            }}>
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Chip label="New" size="small" color="error" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserNotifications; 