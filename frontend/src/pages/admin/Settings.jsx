import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Save,
  Cancel,
  Edit,
  Visibility,
  VisibilityOff,
  Email,
  Business,
  CheckCircle
} from '@mui/icons-material';
import apiService from '../../services/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        

        
        const userData = await apiService.getCurrentUser();
        console.log('User data received:', userData);
        
        if (!userData || !userData.name) {
          throw new Error('Invalid user data received');
        }
        
        setProfileData({
          firstName: userData.name.split(' ')[0] || '',
          lastName: userData.name.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          company: userData.company || 'NetAegis Security',
          position: userData.role || 'User',
          avatar: userData.name.split(' ').map(n => n[0]).join('')
        });
        
        // Load notification preferences
        if (userData.notificationPreferences) {
          setAlertPreferences({
            emailNotifications: userData.notificationPreferences.emailNotifications ?? true,
            pushNotifications: userData.notificationPreferences.pushNotifications ?? true,
            reportAlerts: userData.notificationPreferences.reportAlerts ?? false
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [alertPreferences, setAlertPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    reportAlerts: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleAlertPreferenceChange = async (field, value) => {
    const newPreferences = { ...alertPreferences, [field]: value };
    setAlertPreferences(newPreferences);
    
    try {
      await apiService.updateNotificationPreferences(newPreferences);
      setSnackbar({ open: true, message: 'Notification preferences updated!', severity: 'success' });
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      // Revert the change if it failed
      setAlertPreferences(prev => ({ ...prev, [field]: !value }));
      setSnackbar({ open: true, message: 'Failed to update notification preferences', severity: 'error' });
    }
  };



  const handleSaveProfile = async () => {
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Update the current user's profile using the new endpoint
      await apiService.updateProfile(fullName, profileData.position);
      
      // Refresh the profile data
      const refreshedUserData = await apiService.getCurrentUser();
      setProfileData({
        firstName: refreshedUserData.name.split(' ')[0] || '',
        lastName: refreshedUserData.name.split(' ').slice(1).join(' ') || '',
        email: refreshedUserData.email || '',
        company: refreshedUserData.company || 'NetAegis Security',
        position: refreshedUserData.role || 'User',
        avatar: refreshedUserData.name.split(' ').map(n => n[0]).join('')
      });
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({ open: true, message: 'Failed to update profile. Please try again.', severity: 'error' });
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSnackbar({ open: true, message: 'New passwords do not match!', severity: 'error' });
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setSnackbar({ open: true, message: 'Password must be at least 6 characters long!', severity: 'error' });
        return;
      }
      
      // Password complexity validation
      const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
      const hasNumber = /\d/.test(passwordData.newPassword);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordData.newPassword);
      
      if (!hasUppercase || !hasNumber || !hasSpecial) {
        setSnackbar({ 
          open: true, 
          message: 'Password must contain at least one uppercase letter, one number, and one special character!', 
          severity: 'error' 
        });
        return;
      }

      await apiService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setSnackbar({ open: true, message: 'Failed to change password. Please check your current password and try again.', severity: 'error' });
    }
  };



  const togglePasswordVisibility = (field) => {
    setPasswordData(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Settings & Profile
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Profile Information</Typography>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={() => setIsEditing(!isEditing)}
                color={isEditing ? "error" : "primary"}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                {profileData?.firstName?.charAt(0) || 'U'}{profileData?.lastName?.charAt(0) || ''}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {profileData?.firstName || 'User'} {profileData?.lastName || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profileData?.position || 'User'} at {profileData?.company || 'Company'}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData?.firstName || ''}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData?.lastName || ''}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData?.email || ''}
                  disabled={true}
                  InputProps={{
                    startAdornment: <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  value={profileData?.company || ''}
                  disabled={true}
                  InputProps={{
                    startAdornment: <Business fontSize="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={passwordData.showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('showCurrentPassword')}
                        edge="end"
                      >
                        {passwordData.showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={passwordData.showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('showNewPassword')}
                        edge="end"
                      >
                        {passwordData.showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={passwordData.showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('showConfirmPassword')}
                        edge="end"
                      >
                        {passwordData.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleChangePassword}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>

        {/* Alert Preferences */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Typography variant="h6" gutterBottom>
              Alert Preferences
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Notifications"
                  secondary="Receive alerts via email"
                />
                <Switch
                  checked={alertPreferences.emailNotifications}
                  onChange={(e) => handleAlertPreferenceChange('emailNotifications', e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText 
                  primary="Push Notifications"
                  secondary="Receive in-app notifications"
                />
                <Switch
                  checked={alertPreferences.pushNotifications}
                  onChange={(e) => handleAlertPreferenceChange('pushNotifications', e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText 
                  primary="Report Alerts"
                  secondary="Receive report notifications"
                />
                <Switch
                  checked={alertPreferences.reportAlerts}
                  onChange={(e) => handleAlertPreferenceChange('reportAlerts', e.target.checked)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>


      </Grid>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Profile changes are saved immediately. Password changes require current password verification. 
          Alert preferences are applied in real-time.
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

export default Settings;