import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import {
  Business,
  CheckCircle,
  Cancel,
  Payment,
  Upgrade,
  Star,
  CreditCard,
  CalendarToday,
  Refresh,
  Add
} from '@mui/icons-material';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingPeriod] = useState('monthly');

  // Fetch current subscription on component mount
  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view subscription details');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/my-subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const subscription = await response.json();
        setCurrentSubscription(subscription);
        setError(null);
      } else if (response.status === 404) {
        // No subscription found
        setCurrentSubscription(null);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch subscription');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to fetch subscription details');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlanFeatures = () => {
    if (!currentSubscription) return [];
    
    const plan = currentSubscription.plan_details;
    return [
      `Up to ${plan.max_users} users`,
      plan.ml_threat_detection ? 'ML-based threat detection' : 'Basic threat detection',
      `CSV upload up to ${plan.csv_upload_limit} records`,
      plan.email_alerts ? 'Email alerts supported' : 'No email alerts',
      `Detection log storage up to ${plan.storage_limit_gb}GB`
    ];
  };

  const handleTakeSubscription = () => {
    // Redirect to prelogin page while keeping user logged in
    navigate('/');
  };

  const getCurrentPlanDisplay = () => {
    if (!currentSubscription) {
      return {
        name: 'No Plan',
        price: '₹0',
        billingCycle: 'N/A',
        nextBilling: 'N/A',
        status: 'inactive',
        features: []
      };
    }

    // Map plan names to their correct pricing
    const planPricing = {
      'Starter': { monthly: '₹499', yearly: '₹4,999' },
      'Pro': { monthly: '₹1,999', yearly: '₹19,999' }
    };

    const planName = currentSubscription.plan_name;
    const pricing = planPricing[planName] || { monthly: '₹0', yearly: '₹0' };
    
    // Determine if it's yearly based on billing_period or end_date calculation
    const isYearly = currentSubscription.billing_period === 'yearly' || 
                     (currentSubscription.end_date && 
                      new Date(currentSubscription.end_date).getTime() - new Date(currentSubscription.created_at).getTime() > 30 * 24 * 60 * 60 * 1000);

    return {
      name: planName,
      price: isYearly ? pricing.yearly : pricing.monthly,
      billingCycle: isYearly ? 'yearly' : 'monthly',
      nextBilling: 'N/A', // Could be calculated from end_date if needed
      status: currentSubscription.status,
      features: getCurrentPlanFeatures()
    };
  };

  const currentPlan = getCurrentPlanDisplay();

  const availablePlans = [
    {
      name: 'Starter',
      price: '₹499',
      billingCycle: 'monthly',
      yearlyPrice: '₹4,999',
      features: [
        'Up to 5 users',
        'ML-based threat detection',
        'CSV upload up to 100 records',
        'No email alerts',
        'Detection log storage up to 1GB'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '₹1,999',
      billingCycle: 'monthly',
      yearlyPrice: '₹19,999',
      features: [
        'Up to 25 users',
        'ML-based threat detection',
        'CSV upload up to 500 records',
        'Email alerts supported',
        'Detection log storage up to 5GB'
      ],
      popular: true
    }
  ];

  // Generate payment history from current subscription (no duplicates)
  const getPaymentHistory = () => {
    if (!currentSubscription) return [];
    
    // Create a single payment record from the current subscription
    return [{
      id: currentSubscription._id || 'current',
      paymentDate: new Date(currentSubscription.created_at).toLocaleDateString(),
      method: 'Credit Card', // Default method since we don't store this
      expiryDate: currentSubscription.end_date 
        ? new Date(currentSubscription.end_date).toLocaleDateString()
        : 'No expiry set'
    }];
  };

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setUpgradeDialog(true);
  };

  const handleUpgradeConfirm = () => {
    setSnackbar({ open: true, message: 'Plan upgrade initiated successfully!', severity: 'success' });
    setUpgradeDialog(false);
    setSelectedPlan(null);
  };





  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Subscription Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCurrentSubscription}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <>
          {/* No Subscription Call-to-Action */}
          {!currentSubscription && (
            <Paper sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                No Active Subscription
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                You don't have an active subscription. Take a subscription to unlock all features and start using NetAegis.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleTakeSubscription}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.5)'
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Take Subscription Now
              </Button>
            </Paper>
          )}

          {/* Current Plan Overview */}
          <Grid container rowSpacing={3} columnSpacing={3} columns={12} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Current Plan</Typography>
                  <Chip 
                    label={currentPlan.status} 
                    color={currentPlan.status === 'active' ? 'success' : 'error'} 
                    icon={currentPlan.status === 'active' ? <CheckCircle /> : <Cancel />}
                  />
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Business sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {currentPlan.name} Plan
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {currentPlan.price}/{currentPlan.billingCycle}
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
                
                {/* Take Subscription Button - Only show when no active subscription */}
                {!currentSubscription && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={handleTakeSubscription}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        },
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      Take Subscription
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click to go to the subscription page and choose your plan
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>


          </Grid>

          {/* Available Plans */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Available Plans</Typography>
              {!currentSubscription && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleTakeSubscription}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Take Subscription
                </Button>
              )}
            </Box>
            
            {/* Billing Period Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2, 
                p: 0.5,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Button
                  variant={billingPeriod === 'monthly' ? 'contained' : 'text'}
                  onClick={() => setBillingPeriod('monthly')}
                  sx={{
                    minWidth: 100,
                    color: billingPeriod === 'monthly' ? 'white' : 'text.secondary',
                    bgcolor: billingPeriod === 'monthly' ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: billingPeriod === 'monthly' ? 'primary.dark' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Monthly
                </Button>
                <Button
                  variant={billingPeriod === 'yearly' ? 'contained' : 'text'}
                  onClick={() => setBillingPeriod('yearly')}
                  sx={{
                    minWidth: 100,
                    color: billingPeriod === 'yearly' ? 'white' : 'text.secondary',
                    bgcolor: billingPeriod === 'yearly' ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: billingPeriod === 'yearly' ? 'primary.main' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Yearly
                </Button>
              </Box>
            </Box>
            
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
                        {billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice}
                        <Typography component="span" variant="body2" color="text.secondary">
                          /{billingPeriod}
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
                        ) : plan.name === 'Pro' && currentPlan.name === 'Starter' ? (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Upgrade />}
                            onClick={() => handleUpgradeClick(plan)}
                            sx={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                              }
                            }}
                          >
                            Upgrade to Pro
                          </Button>
                        ) : null}
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
            
            {getPaymentHistory().length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPaymentHistory().map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CreditCard fontSize="small" color="primary" />
                            <Typography variant="body2">{payment.method}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{payment.paymentDate}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{payment.expiryDate}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
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
                  Your payment history will appear here once you make payments.
                </Typography>
              </Box>
            )}
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
              {currentSubscription ? (
                <>
                  <strong>Subscription Active:</strong> Your subscription is now working! You can view your current plan details above. 
                  To upgrade or change plans, use the payment gateway from the homepage.
                </>
              ) : (
                <>
                  <strong>No Active Subscription:</strong> You need to take a subscription to access NetAegis features. 
                  Click the "Take Subscription" button above to go to the subscription page and choose your plan.
                </>
              )}
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
        </>
      )}
    </Container>
  );
};

export default SubscriptionManagement; 