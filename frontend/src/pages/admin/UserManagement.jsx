import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  Grid,
  Container,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Refresh,
  Email,
  Security,
  People
} from '@mui/icons-material';
import { adminAddUser, adminListUsers, adminDeleteUser } from '../../services/api';
import { useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    role: 'user', // always user in backend
  });

  const roles = ['Network Engineer', 'Security Analyst', 'System Administrator', 'Security Manager'];

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await adminListUsers(token);
      setUsers(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Network Engineer'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Network Engineer'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setValidationDialogOpen(true);
      console.log('Validation failed: showing dialog');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Always send all required fields
      const payload = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        password: formData.password,
        role: 'user', // always user in backend
      };
      await adminAddUser(payload, token);
      setSnackbar({ open: true, message: 'User added successfully', severity: 'success' });
      setOpenDialog(false);
      fetchUsers(); // Just refresh the list, do not navigate
    } catch (err) {
      if (err?.response?.status === 422) {
        setSnackbar({ open: true, message: 'Invalid input: Please fill all fields correctly.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.detail || 'Failed to add user', severity: 'error' });
      }
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    setSnackbar({ open: true, message: 'User status updated!', severity: 'success' });
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await adminDeleteUser(userId, token);
      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      fetchUsers(); // Refresh the list after deletion
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err?.response?.data?.detail || 'Failed to delete user', 
        severity: 'error' 
      });
    }
  };

  const handleResetPassword = (userId) => {
    setSnackbar({ open: true, message: 'Password reset email sent!', severity: 'info' });
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Network Engineer': 'primary',
      'Security Analyst': 'secondary',
      'System Administrator': 'warning',
      'Security Manager': 'error'
    };
    return colors[role] || 'default';
  };

  const activeUsers = users.filter(user => user.is_active).length;
  const totalUsers = users.length;
  const uniqueRoles = [...new Set(users.map(user => user.role))].length;

  return (
    <Fade in timeout={700}>
      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Container maxWidth={false} sx={{ px: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                User Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage system users and their permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c50e29 0%, #ff1744 100%)'
                },
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(183,28,28,0.3)'
              }}
            >
              Add New User
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {totalUsers}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#b71c1c', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {activeUsers}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Active Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Security sx={{ fontSize: 48, color: '#ff5252', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {uniqueRoles}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    User Roles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Users Table */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(183,28,28,0.1)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>User</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Role</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Last Login</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id}
                      sx={{ 
                        '&:hover': { 
                          background: 'rgba(183,28,28,0.05)',
                          transition: 'background 0.3s ease'
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            bgcolor: user.status === 'active' ? '#b71c1c' : '#3a2323',
                            width: 48,
                            height: 48
                          }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role)}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'active' : 'inactive'} 
                          color={getStatusColor(user.is_active ? 'active' : 'inactive')}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit User">
                            <IconButton 
                              onClick={() => handleOpenDialog(user)}
                              sx={{ color: '#b71c1c' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password">
                            <IconButton 
                              onClick={() => handleResetPassword(user._id)}
                              sx={{ color: '#ff9800' }}
                            >
                              <Security />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              onClick={() => handleDeleteUser(user._id)}
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Add/Edit User Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          >
            <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={handleChange}
                  name="company"
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  error={!!formErrors.company}
                  helperText={formErrors.company}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange}
                    name="role"
                    sx={{ color: 'white' }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c50e29 0%, #ff1744 100%)'
                  }
                }}
              >
                {editingUser ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Validation Dialog */}
          <Dialog
            open={validationDialogOpen}
            onClose={() => setValidationDialogOpen(false)}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          >
            <DialogTitle sx={{ color: 'white', fontWeight: 'bold' }}>Incomplete Information</DialogTitle>
            <DialogContent>
              Please fill in all required fields before adding a user.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setValidationDialogOpen(false)} color="primary" autoFocus>OK</Button>
            </DialogActions>
          </Dialog>

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
        </Container>
      </Box>
    </Fade>
  );
};

export default UserManagement; 