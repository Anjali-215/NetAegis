import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Container,
  Fade,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Alert
} from '@mui/material';
import {
  Settings,
  Notifications,
  Security,
  Visibility,
  Save
} from '@mui/icons-material';

const UserSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    threatAlerts: true,
    weeklyReports: false,
    dataRetention: 30,
    autoAnalysis: true
  });

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Tech Corp'
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleProfileChange = (field) => (event) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
              Your Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage your personal preferences and account settings
            </Typography>
          </Box>

          {saved && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings saved successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Profile Settings */}
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Settings sx={{ color: '#b71c1c', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Profile Settings
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profile.name}
                        onChange={handleProfileChange('name')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#b71c1c',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profile.email}
                        onChange={handleProfileChange('email')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#b71c1c',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={profile.company}
                        onChange={handleProfileChange('company')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#b71c1c',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Settings */}
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Notifications sx={{ color: '#b71c1c', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Notification Settings
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={handleSettingChange('emailNotifications')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#b71c1c',
                              '&:hover': {
                                backgroundColor: 'rgba(183,28,28,0.08)',
                              },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#b71c1c',
                            },
                          }}
                        />
                      }
                      label="Email Notifications"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.threatAlerts}
                          onChange={handleSettingChange('threatAlerts')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#b71c1c',
                              '&:hover': {
                                backgroundColor: 'rgba(183,28,28,0.08)',
                              },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#b71c1c',
                            },
                          }}
                        />
                      }
                      label="Threat Alerts"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.weeklyReports}
                          onChange={handleSettingChange('weeklyReports')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#b71c1c',
                              '&:hover': {
                                backgroundColor: 'rgba(183,28,28,0.08)',
                              },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#b71c1c',
                            },
                          }}
                        />
                      }
                      label="Weekly Reports"
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Security Settings */}
            <Grid xs={12}>
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Security sx={{ color: '#b71c1c', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Security Settings
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.autoAnalysis}
                            onChange={handleSettingChange('autoAnalysis')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#b71c1c',
                                '&:hover': {
                                  backgroundColor: 'rgba(183,28,28,0.08)',
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#b71c1c',
                              },
                            }}
                          />
                        }
                        label="Auto Analysis"
                        sx={{ color: 'white' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Automatically analyze uploaded files for threats
                      </Typography>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                        Data Retention (days)
                      </Typography>
                      <TextField
                        type="number"
                        value={settings.dataRetention}
                        onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#b71c1c',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{
                background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7f0000 0%, #c50e29 100%)',
                },
                px: 4,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Save Settings
            </Button>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserSettings; 