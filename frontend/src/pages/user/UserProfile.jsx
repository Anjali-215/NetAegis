import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Person,
  Email,
  Business,
  Security,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { Fade } from '@mui/material';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    company: 'Tech Corp',
    role: 'user',
    created_at: '2024-01-15'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Get user info from localStorage or API
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (userInfo.name) {
      setUser({
        ...userInfo,
        created_at: userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString('en-GB') : 'N/A'
      });
      setEditedUser({
        ...userInfo,
        created_at: userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString('en-GB') : 'N/A'
      });
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  return (
    <Fade in timeout={700}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth="md" sx={{ px: 0 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
              textAlign: 'center'
            }}
          >
            My Profile
          </Typography>

          <Grid container spacing={3}>
            {/* Profile Card */}
            <Grid xs={12} md={4}>
              <Paper sx={{ 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                p: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: '#b71c1c',
                    fontSize: '3rem'
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                  {user.name}
                </Typography>
                <Chip 
                  label={user.role} 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Member since {user.created_at}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.company}
                </Typography>
              </Paper>
            </Grid>

            {/* Profile Details */}
            <Grid xs={12} md={8}>
              <Paper sx={{ 
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                p: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Profile Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      sx={{ 
                        background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #c50e29 0%, #ff1744 100%)'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{ 
                          background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #c50e29 0%, #ff1744 100%)'
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        variant="outlined"
                        sx={{ 
                          borderColor: '#ff5252',
                          color: '#ff5252',
                          '&:hover': {
                            borderColor: '#ff1744',
                            backgroundColor: 'rgba(255,82,82,0.1)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={isEditing ? editedUser.name : user.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={isEditing ? editedUser.email : user.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={isEditing ? editedUser.company : user.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      disabled={!isEditing}
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Joined"
                      value={user.created_at}
                      disabled
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { color: 'rgba(255,255,255,0.5)' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Account Security */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>
                  Account Security
                </Typography>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Security sx={{ color: '#ff5252' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last changed: {new Date().toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default UserProfile; 