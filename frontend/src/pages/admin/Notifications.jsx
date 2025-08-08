import React, { useState, useEffect } from 'react';
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  Refresh,
  Visibility
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [threatDetailsOpen, setThreatDetailsOpen] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:8000/notifications', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
                     if (response.ok) {
             const data = await response.json();
             console.log('Fetched notifications:', data); // Debug log
             setNotifications(data);
           }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications(notifications.map(notification =>
          (notification.id || notification._id) === notificationId
            ? { ...notification, read: true }
            : notification
        ));
        setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setSnackbar({ open: true, message: 'Failed to mark notification as read', severity: 'error' });
    }
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(notifications.map(notification =>
      (notification.id || notification._id) === notificationId
        ? { ...notification, read: false }
        : notification
    ));
    setSnackbar({ open: true, message: 'Notification marked as unread', severity: 'success' });
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications(notifications.filter(notification => (notification.id || notification._id) !== notificationId));
        setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({ open: true, message: 'Failed to delete notification', severity: 'error' });
    }
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      const notificationId = notificationToDelete.id || notificationToDelete._id;
      console.log('Deleting notification with ID:', notificationId); // Debug log
      console.log('Notification object:', notificationToDelete); // Debug log
      await handleDeleteNotification(notificationId);
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleClearAllClick = () => {
    setClearAllConfirmOpen(true);
  };

  const handleConfirmClearAll = async () => {
    await handleClearAll();
    setClearAllConfirmOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setSnackbar({ open: true, message: 'Failed to mark all notifications as read', severity: 'error' });
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications([]);
        setSnackbar({ open: true, message: 'All notifications cleared', severity: 'success' });
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      setSnackbar({ open: true, message: 'Failed to clear all notifications', severity: 'error' });
    }
  };

  const handleViewThreatDetails = (notification) => {
    if (notification.type === 'threat') {
      setSelectedThreat(notification);
      setThreatDetailsOpen(true);
    }
  };

  const handleCloseThreatDetails = () => {
    setThreatDetailsOpen(false);
    setSelectedThreat(null);
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
        return '#b71c1c';
      case 'upload':
        return '#ff5252';
      case 'system':
        return '#c50e29';
      case 'user':
        return '#7f0000';
      case 'report':
        return '#231417';
      default:
        return '#3a2323';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'primary';
      case 'low':
        return 'default';
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
            onClick={handleClearAllClick}
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
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : (
          <List>
                         {notifications.map((notification, index) => (
             <React.Fragment key={notification.id || notification._id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Box display="flex" gap={1}>
                    {notification.type === 'threat' && (
                      <Tooltip title="View Threat Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewThreatDetails(notification)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                                         <Tooltip title={notification.read ? "Mark as unread" : "Mark as read"}>
                       <IconButton 
                         size="small" 
                         onClick={() => notification.read 
                           ? handleMarkAsUnread(notification.id || notification._id)
                           : handleMarkAsRead(notification.id || notification._id)
                         }
                         color={notification.read ? "default" : "primary"}
                       >
                         {notification.read ? <MarkEmailUnread /> : <MarkEmailRead />}
                       </IconButton>
                     </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(notification)}
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
        )}
        
        {!loading && notifications.length === 0 && (
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#23272F',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Delete sx={{ color: '#d32f2f' }} />
          <Typography variant="h6">
            Delete Notification
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this notification?
          </Typography>
          {notificationToDelete && (
            <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
              "{notificationToDelete.title}"
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2
        }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog 
        open={clearAllConfirmOpen} 
        onClose={() => setClearAllConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#23272F',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Delete sx={{ color: '#d32f2f' }} />
          <Typography variant="h6">
            Clear All Notifications
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete all notifications? This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            This will permanently remove all {notifications.length} notifications.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2
        }}>
          <Button 
            onClick={() => setClearAllConfirmOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleConfirmClearAll}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Threat Details Dialog */}
      <Dialog 
        open={threatDetailsOpen} 
        onClose={handleCloseThreatDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#23272F',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        {selectedThreat && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Security sx={{ color: '#b71c1c' }} />
              <Typography variant="h6">
                Threat Details
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#b71c1c' }}>
                  {selectedThreat.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedThreat.message}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip 
                    label={`Priority: ${selectedThreat.priority}`}
                    color={getPriorityColor(selectedThreat.priority)}
                    variant="outlined"
                  />
                  <Chip 
                    label={`Type: ${selectedThreat.type}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <strong>Detected:</strong> {selectedThreat.created_at || 'Unknown time'}
                </Typography>
                
                {selectedThreat.action_link && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      <strong>Related Section:</strong> Detection Logs
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {
                        handleCloseThreatDetails();
                        window.location.href = selectedThreat.action_link;
                      }}
                    >
                      View in Detection Logs
                    </Button>
                  </Box>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              p: 2
            }}>
              <Button 
                onClick={handleCloseThreatDetails}
                color="inherit"
              >
                Close
              </Button>
              {selectedThreat.action_link && (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleCloseThreatDetails();
                    window.location.href = selectedThreat.action_link;
                  }}
                >
                  Go to Detection Logs
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

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