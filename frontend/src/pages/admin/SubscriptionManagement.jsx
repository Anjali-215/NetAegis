import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business,
  CheckCircle,
  Cancel,
  Payment,
  Upgrade,
  Download,
  Receipt,
  Security,
  People,
  Storage,
  Speed,
  Support,
  Star,
  TrendingUp,
  CreditCard,
  CalendarToday
} from '@mui/icons-material';

const SubscriptionManagement = () => {
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const currentPlan = {
    name: 'Pro',
    price: 1999,
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    status: 'inactive',
    features: [
      'Up to 25 users',
      'Threat detection',
      '10GB log storage',
      'Priority support',
      'Standard reports',
      '24/7 support',
      'Custom reports',
      'Real-time alerts'
    ]
  };

  const availablePlans = [
    {
      name: 'Starter',
      price: 499,
      billingCycle: 'monthly',
      yearlyPrice: 4999,
      features: [
        'Up to 5 users',
        'Threat detection',
        '1GB log storage',
        'Email support',
        'Standard reports',
        '24/7 support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: 1999,
      billingCycle: 'monthly',
      yearlyPrice: 19999,
      features: [
        'Up to 25 users',
        'Threat detection',
        '10GB log storage',
        'Priority support',
        'Standard reports',
        '24/7 support',
        'Custom reports',
        'Real-time alerts'
      ],
      popular: true
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 1999.00,
      status: 'paid',
      invoice: 'INV-2024-001',
      method: 'Credit Card',
      description: 'Pro Plan - Monthly'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 1999.00,
      status: 'paid',
      invoice: 'INV-2023-012',
      method: 'Credit Card',
      description: 'Pro Plan - Monthly'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 1999.00,
      status: 'paid',
      invoice: 'INV-2023-011',
      method: 'Credit Card',
      description: 'Pro Plan - Monthly'
    },
    {
      id: 4,
      date: '2023-10-15',
      amount: 499.00,
      status: 'paid',
      invoice: 'INV-2023-010',
      method: 'Credit Card',
      description: 'Starter Plan - Monthly'
    },
    {
      id: 5,
      date: '2023-09-15',
      amount: 499.00,
      status: 'paid',
      invoice: 'INV-2023-009',
      method: 'Credit Card',
      description: 'Starter Plan - Monthly'
    }
  ];

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setUpgradeDialog(true);
  };

  const handleUpgradeConfirm = () => {
    setSnackbar({ open: true, message: 'Plan upgrade initiated successfully!', severity: 'success' });
    setUpgradeDialog(false);
    setSelectedPlan(null);
  };

  const handleDownloadInvoice = (invoice) => {
    setSnackbar({ open: true, message: `Downloading invoice ${invoice}...`, severity: 'info' });
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'primary' : 'error';
  };

  const getStatusIcon = (status) => {
    return status === 'paid' ? <CheckCircle /> : <Cancel />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Subscription Management
      </Typography>

      {/* Current Plan Overview */}
      <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Current Plan</Typography>
              <Chip 
                label={currentPlan.status} 
                color="error" 
                icon={<Cancel />}
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Business sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {currentPlan.name} Plan
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${currentPlan.price}/{currentPlan.billingCycle}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    Next billing: {currentPlan.nextBilling}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CreditCard fontSize="small" color="action" />
                  <Typography variant="body2">
                    Auto-renewal enabled
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Plan Features
            </Typography>
            <Grid container spacing={2}>
              {currentPlan.features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Statistics
              </Typography>
              
              <List sx={{ color: 'white' }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <Security />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Threat Detections"
                    secondary="Not active - Subscribe to start monitoring"
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <People />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Active Users"
                    secondary="Not active - Subscribe to add users"
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Storage Used"
                    secondary="Not active - Subscribe to use storage"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Available Plans */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Plans
        </Typography>
        
        <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
          {availablePlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  border: plan.name === currentPlan.name ? 2 : 1,
                  borderColor: plan.name === currentPlan.name ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    icon={<Star />}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ pt: plan.popular ? 6 : 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {plan.name}
                  </Typography>
                  
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${plan.price}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /{plan.billingCycle}
                    </Typography>
                  </Typography>
                  
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 2 }}>
                    {plan.name === currentPlan.name ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={plan.price > currentPlan.price ? <Upgrade /> : <TrendingUp />}
                        onClick={() => handleUpgradeClick(plan)}
                        sx={{ 
                          background: plan.popular 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : undefined,
                          '&:hover': plan.popular ? {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                          } : undefined
                        }}
                      >
                        {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Payment History */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Payment History</Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          textAlign: 'center'
        }}>
          <Payment sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Payment History Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscription functionality will be implemented soon. Once activated, your payment history will appear here.
          </Typography>
        </Box>
      </Paper>

      {/* Upgrade Dialog */}
      <Dialog 
        open={upgradeDialog} 
        onClose={() => setUpgradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan?.price > currentPlan.price ? 'Upgrade' : 'Downgrade'} Plan
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You are about to {selectedPlan?.price > currentPlan.price ? 'upgrade' : 'downgrade'} from 
                <strong> {currentPlan.name} Plan</strong> to <strong>{selectedPlan?.name} Plan</strong>.
              </Typography>
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Plan Comparison
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Current Plan
                </Typography>
                <Typography variant="h6" color="primary">
                  ${currentPlan.price}/month
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  New Plan
                </Typography>
                <Typography variant="h6" color="primary">
                  ${selectedPlan?.price}/month
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              The change will take effect at your next billing cycle on {currentPlan.nextBilling}.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpgradeConfirm}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Confirm {selectedPlan?.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Coming Soon:</strong> Subscription functionality is currently under development. 
          Once implemented, you'll be able to activate your subscription, manage your plan, and view payment history from this dashboard.
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

export default SubscriptionManagement; 