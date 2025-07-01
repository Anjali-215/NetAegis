import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  Badge,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security,
  Warning,
  Error,
  Info,
  CheckCircle,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  Settings,
  Refresh
} from '@mui/icons-material';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High Priority Threat Detected',
      message: 'A new malware threat has been detected from IP 192.168.1.100. Immediate action required.',
      type: 'threat',
      priority: 'high',
      timestamp: '2024-01-15 10:30:15',
      read: false,
      actionable: true,
      actionLink: '/admin/detection-logs'
    },
    {
      id: 2,
      title: 'CSV Upload Completed',
      message: 'Threat data CSV file "threat_data_jan_2024.csv" has been successfully processed. 1,247 records imported.',
      type: 'upload',
      priority: 'medium',
      timestamp: '2024-01-15 10:25:30',
      read: false,
      actionable: true,
      actionLink: '/admin/csv-upload'
    },
    {
      id: 3,
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will begin at 2:00 AM EST. Expected downtime: 30 minutes.',
      type: 'system',
      priority: 'low',
      timestamp: '2024-01-15 10:20:00',
      read: true,
      actionable: false
    },
    {
      id: 4,
      title: 'New User Added',
      message: 'User "Sarah Wilson" has been added to the system with role "Security Analyst".',
      type: 'user',
      priority: 'medium',
      timestamp: '2024-01-15 10:15:45',
      read: true,
      actionable: true,
      actionLink: '/admin/user-management'
    },
    {
      id: 5,
      title: 'DDoS Attack Detected',
      message: 'Large-scale DDoS attack detected from multiple sources. Traffic filtering activated.',
      type: 'threat',
      priority: 'high',
      timestamp: '2024-01-15 10:10:20',
      read: false,
      actionable: true,
      actionLink: '/admin/threat-visualization'
    },
    {
      id: 6,
      title: 'Report Generated',
      message: 'Monthly threat report for December 2023 has been generated and is ready for download.',
      type: 'report',
      priority: 'low',
      timestamp: '2024-01-15 10:05:10',
      read: true,
      actionable: true,
      actionLink: '/admin/reports'
    },
    {
      id: 7,
      title: 'Configuration Updated',
      message: 'Alert threshold settings have been updated by admin user.',
      type: 'system',
      priority: 'low',
      timestamp: '2024-01-15 10:00:00',
      read: true,
      actionable: false
    },
    {
      id: 8,
      title: 'Phishing Attempt Blocked',
      message: 'Suspicious phishing email from domain "fake-bank.com" has been blocked.',
      type: 'threat',
      priority: 'medium',
      timestamp: '2024-01-15 09:55:30',
      read: false,
      actionable: true,
      actionLink: '/admin/detection-logs'
    }
  ]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
    setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: false }
        : notification
    ));
    setSnackbar({ open: true, message: 'Notification marked as unread', severity: 'success' });
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
    setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
  };

  const handleClearAll = () => {
    setNotifications([]);
    setSnackbar({ open: true, message: 'All notifications cleared', severity: 'success' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'threat':
        return <Security />;
      case 'upload':
        return <CheckCircle />;
      case 'system':
        return <Settings />;
      case 'user':
        return <Info />;
      case 'report':
        return <CheckCircle />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'threat':
        return '#f44336';
      case 'upload':
        return '#4caf50';
      case 'system':
        return '#2196f3';
      case 'user':
        return '#ff9800';
      case 'report':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;
  const highPriorityCount = notifications.filter(notification => notification.priority === 'high' && !notification.read).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Badge>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Notifications & Alerts
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleClearAll}
            color="error"
          >
            Clear All
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
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
                    {notifications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Notifications
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {unreadCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Unread Notifications
                  </Typography>
                </Box>
                <MarkEmailUnread sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {highPriorityCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    High Priority Alerts
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
                    {notifications.filter(n => n.type === 'threat').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Threat Alerts
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications List */}
      <Paper sx={{ overflow: 'hidden', backgroundColor: '#23272F', color: 'white' }}>
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Box display="flex" gap={1}>
                    {notification.actionable && (
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => window.location.href = notification.actionLink}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title={notification.read ? "Mark as unread" : "Mark as read"}>
                      <IconButton 
                        size="small" 
                        onClick={() => notification.read 
                          ? handleMarkAsUnread(notification.id)
                          : handleMarkAsRead(notification.id)
                        }
                        color={notification.read ? "default" : "primary"}
                      >
                        {notification.read ? <MarkEmailUnread /> : <MarkEmailRead />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteNotification(notification.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="body1" 
                        fontWeight={notification.read ? "normal" : "bold"}
                        sx={{ 
                          textDecoration: notification.read ? "none" : "none",
                          color: notification.read ? "text.primary" : "text.primary"
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip 
                        label={notification.priority} 
                        color={getPriorityColor(notification.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        {notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! New notifications will appear here.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* High Priority Alert */}
      {highPriorityCount > 0 && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Attention:</strong> You have {highPriorityCount} high priority alerts that require immediate attention.
          </Typography>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Click on actionable notifications to navigate directly to the relevant section. 
          High priority alerts are automatically highlighted and should be addressed promptly.
        </Typography>
      </Alert>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationsPage; 