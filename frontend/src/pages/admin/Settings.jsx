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
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Save,
  Cancel,
  Edit,
  Visibility,
  VisibilityOff,
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  Business,
  Warning,
  CheckCircle,
  Error,
  Info,
  DarkMode,
  LightMode,
  VolumeUp,
  VolumeOff,
  Refresh
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
        const userData = await apiService.getCurrentUser();
        setProfileData({
          firstName: userData.name.split(' ')[0] || '',
          lastName: userData.name.split(' ').slice(1).join(' ') || '',
          email: userData.email,
          phone: userData.phone || '',
          company: userData.company || 'NetAegis Security',
          position: userData.role || 'User',
          location: userData.location || '',
          avatar: userData.name.split(' ').map(n => n[0]).join('')
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
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
    smsNotifications: false,
    pushNotifications: true,
    threatAlerts: true,
    systemAlerts: true,
    reportAlerts: false,
    weeklyDigest: true,
    alertVolume: 75,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [systemSettings, setSystemSettings] = useState({
    darkMode: false,
    autoRefresh: true,
    refreshInterval: 30,
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleAlertPreferenceChange = (field, value) => {
    setAlertPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemSettingChange = (field, value) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUserData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
        location: profileData.location,
        role: profileData.position
      };

      await apiService.adminUpdateUser(profileData.id, updatedUserData);
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
      if (passwordData.newPassword.length < 8) {
        setSnackbar({ open: true, message: 'Password must be at least 8 characters long!', severity: 'error' });
        return;
      }

      await apiService.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

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

  const handleSaveSettings = () => {
    setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
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
                {profileData.avatar}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profileData.position} at {profileData.company}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  value={profileData.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Business fontSize="small" color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
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
                  <Phone />
                </ListItemIcon>
                <ListItemText 
                  primary="SMS Notifications"
                  secondary="Receive alerts via SMS"
                />
                <Switch
                  checked={alertPreferences.smsNotifications}
                  onChange={(e) => handleAlertPreferenceChange('smsNotifications', e.target.checked)}
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
                  <Warning />
                </ListItemIcon>
                <ListItemText 
                  primary="Threat Alerts"
                  secondary="High priority threat notifications"
                />
                <Switch
                  checked={alertPreferences.threatAlerts}
                  onChange={(e) => handleAlertPreferenceChange('threatAlerts', e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText 
                  primary="System Alerts"
                  secondary="System maintenance and updates"
                />
                <Switch
                  checked={alertPreferences.systemAlerts}
                  onChange={(e) => handleAlertPreferenceChange('systemAlerts', e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText 
                  primary="Weekly Digest"
                  secondary="Summary of weekly activities"
                />
                <Switch
                  checked={alertPreferences.weeklyDigest}
                  onChange={(e) => handleAlertPreferenceChange('weeklyDigest', e.target.checked)}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Alert Volume
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <VolumeOff fontSize="small" color="action" />
              <Slider
                value={alertPreferences.alertVolume}
                onChange={(e, value) => handleAlertPreferenceChange('alertVolume', value)}
                aria-label="Alert Volume"
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
              <VolumeUp fontSize="small" color="action" />
            </Box>
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: '#23272F', color: '#fff' }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  {systemSettings.darkMode ? <DarkMode /> : <LightMode />}
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode"
                  secondary="Toggle dark/light theme"
                />
                <Switch
                  checked={systemSettings.darkMode}
                  onChange={(e) => handleSystemSettingChange('darkMode', e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Refresh />
                </ListItemIcon>
                <ListItemText 
                  primary="Auto Refresh"
                  secondary="Automatically refresh data"
                />
                <Switch
                  checked={systemSettings.autoRefresh}
                  onChange={(e) => handleSystemSettingChange('autoRefresh', e.target.checked)}
                />
              </ListItem>
            </List>

            {systemSettings.autoRefresh && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Refresh Interval (seconds)
                </Typography>
                <Slider
                  value={systemSettings.refreshInterval}
                  onChange={(e, value) => handleSystemSettingChange('refreshInterval', value)}
                  aria-label="Refresh Interval"
                  valueLabelDisplay="auto"
                  min={10}
                  max={300}
                  step={10}
                />
                <Typography variant="caption" color="text.secondary">
                  {systemSettings.refreshInterval} seconds
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={systemSettings.language}
                    label="Language"
                    onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={systemSettings.timezone}
                    label="Timezone"
                    onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                  >
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Profile changes are saved immediately. Password changes require current password verification. 
          Alert preferences and system settings are applied in real-time.
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