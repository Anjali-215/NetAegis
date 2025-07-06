import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Grid, 
  Chip, 
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { AccountCircle, Logout, Edit } from '@mui/icons-material';
import apiService from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@company.com',
    role: 'Administrator',
    department: 'Security',
    location: 'New York, NY',
    joined: '2023-01-15',
    avatar: 'JD',
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user data from API
    const loadUserData = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getCurrentUser();
          setUser({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            department: userData.company || 'Security',
            location: 'New York, NY',
            joined: new Date(userData.created_at).toLocaleDateString(),
            avatar: userData.name.split(' ').map(n => n[0]).join(''),
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear token and user data
      apiService.removeToken();
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
      setLogoutDialogOpen(false);
    }
  };

  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #231417 100%)',
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.10)',
        p: 4
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ width: 96, height: 96, bgcolor: '#b71c1c', fontSize: 40, mb: 2 }}>
              {user.avatar || <AccountCircle fontSize="large" />}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
              {user.name}
            </Typography>
            <Chip label={user.role} color="primary" sx={{ fontWeight: 'bold', fontSize: 16, mb: 1 }} />
            <Typography variant="body1" sx={{ opacity: 0.8, textAlign: 'center' }}>{user.email}</Typography>
          </Box>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.10)' }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Department</Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Location</Typography>
              <Typography variant="body1">{user.location}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
              <Typography variant="body1">{user.joined}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Role</Typography>
              <Typography variant="body1">{user.role}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.10)' }} />
          
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<Edit />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Logout />}
              onClick={openLogoutDialog}
              sx={{
                backgroundColor: '#b71c1c',
                '&:hover': {
                  backgroundColor: '#8e0000'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={closeLogoutDialog}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout? You will need to login again to access your account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleLogout} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 