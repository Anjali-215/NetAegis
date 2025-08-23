import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  TextField,
  Alert,
  IconButton,
  Button
} from '@mui/material';
import {
  Security,
  Visibility,
  VisibilityOff,
  Save
} from '@mui/icons-material';
import apiService from '../../services/api';

const UserChangePassword = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [message, setMessage] = useState({ show: false, type: 'success', text: '' });

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordData(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ show: true, type: 'error', text: 'New passwords do not match!' });
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setMessage({ show: true, type: 'error', text: 'Password must be at least 6 characters long!' });
        return;
      }
      
      // Password complexity validation
      const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
      const hasNumber = /\d/.test(passwordData.newPassword);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordData.newPassword);
      
      if (!hasUppercase || !hasNumber || !hasSpecial) {
        setMessage({ 
          show: true, 
          type: 'error', 
          text: 'Password must contain at least one uppercase letter, one number, and one special character!' 
        });
        return;
      }

      await apiService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setMessage({ show: true, type: 'success', text: 'Password changed successfully!' });
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
      setMessage({ 
        show: true, 
        type: 'error', 
        text: 'Failed to change password. Please check your current password and try again.' 
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Change Password
      </Typography>

      {message.show && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ ...message, show: false })}
        >
          {message.text}
        </Alert>
      )}

      <Card sx={{ backgroundColor: '#23272F', color: '#fff' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Security sx={{ color: '#b71c1c', mr: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Change Password
            </Typography>
          </Box>

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
            sx={{ 
              mt: 2,
              background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7f0000 0%, #c50e29 100%)',
              }
            }}
            onClick={handleChangePassword}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            startIcon={<Save />}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserChangePassword;
