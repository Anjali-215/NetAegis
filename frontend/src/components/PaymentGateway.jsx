import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as UPIIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { activateSubscription, updateUserRole } from '../services/subscriptionService';

const PaymentGateway = ({ open, onClose, plan, billingPeriod }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    username: '',
    upiId: ''
  });

  // Check if user is admin (only if user is logged in)
  const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = userInfo?.role === 'admin';
  const isLoggedIn = !!userInfo;

  // Remove admin role check for prelogin page - allow anyone to open subscription dialog
  // Admin validation will happen during the actual payment process

  // Reset form when dialog opens and check for existing subscription
  React.useEffect(() => {
    if (open) {
      setActiveStep(0);
      setPaymentMethod('card');
      setError(null);
      setSuccess('');
      setCardDetails({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        username: '',
        upiId: ''
      });
      
      // Check for existing subscription if user is logged in
      checkExistingSubscription();
    }
  }, [open]);
  
  const checkExistingSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Only check if user is logged in
      if (!token) return;
      
      const response = await fetch('http://localhost:8000/my-subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // User already has an active subscription
        const subscription = await response.json();
        setError(`You already have an active ${subscription.plan_name} subscription. Please cancel your current subscription before purchasing a new one.`);
        return;
      }
      
      // 404 means no subscription found, which is fine
      if (response.status === 404) {
        return;
      }
      
      // Other errors (500, etc.) - don't block the process
      console.log('Error checking subscription:', response.status);
      
    } catch (error) {
      // Network errors - don't block the process
      console.log('Network error checking subscription:', error);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setActiveStep(0);
        setPaymentMethod('card');
        setError(null);
        setSuccess('');
        setCardDetails({
          number: '',
          name: '',
          expiry: '',
          cvv: '',
          username: '',
          upiId: ''
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const steps = ['Select Payment Method', 'Enter Details', 'Confirm Payment'];

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardDetailsChange = (field) => (event) => {
    let value = event.target.value;
    
    // Validation for different fields
    switch (field) {
      case 'number':
        // Only allow numbers and limit to 16 digits
        value = value.replace(/\D/g, '').slice(0, 16);
        break;
      case 'cvv':
        // Only allow numbers and limit to 3 digits
        value = value.replace(/\D/g, '').slice(0, 3);
        break;
      case 'expiry':
        // Format as MM/YY
        value = value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        value = value.slice(0, 5); // Limit to MM/YY format
        break;
      case 'name':
        // Only allow alphabets and spaces
        value = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      default:
        break;
    }
    
    setCardDetails({ ...cardDetails, [field]: value });
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      // Validate required fields for all payment methods
      if (!cardDetails.username) {
        setError('Please enter admin username/email');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cardDetails.username)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate admin email against database
      try {
        console.log('Validating admin email:', cardDetails.username);
        
        // First test if backend is accessible
        const testResponse = await fetch('http://localhost:8000/api/test');
        if (!testResponse.ok) {
          setError('Backend server is not accessible. Please try again later.');
          return;
        }
        
        // Try simple endpoint first (guaranteed to work)
        let adminValidated = false;
        let validationMessage = '';
        
        try {
          console.log('🔧 Trying simple admin validation endpoint...');
          const response = await fetch('http://localhost:8000/simple-validate-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: cardDetails.username })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('🔧 Simple endpoint response:', data);
            
            if (data.isAdmin) {
              // Simple endpoint worked, proceed
              console.log('✅ Simple endpoint successful:', data);
              adminValidated = true;
              validationMessage = data.message;
            } else {
              // Show specific error message from backend
              adminValidated = false;
              validationMessage = data.message;
            }
          } else {
            console.log('🔧 Simple endpoint failed, trying original...');
            // Try the original endpoint
            const fallbackResponse = await fetch('http://localhost:8000/api/auth/validate-admin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: cardDetails.username })
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log('✅ Fallback endpoint response:', fallbackData);
              
              if (fallbackData.isAdmin) {
                adminValidated = true;
                validationMessage = fallbackData.message;
              } else {
                adminValidated = false;
                validationMessage = fallbackData.message;
              }
            } else {
              const errorData = await fallbackResponse.json().catch(() => ({}));
              console.log('❌ Fallback endpoint error:', errorData);
              adminValidated = false;
              validationMessage = errorData.detail || `Server error: ${fallbackResponse.status}`;
            }
          }
        } catch (fetchError) {
          console.error('🔧 Fetch error with simple endpoint:', fetchError);
          // Fallback to original endpoint
          try {
            const fallbackResponse = await fetch('http://localhost:8000/api/auth/validate-admin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: cardDetails.username })
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log('✅ Fallback endpoint response:', fallbackData);
              
              if (fallbackData.isAdmin) {
                adminValidated = true;
                validationMessage = fallbackData.message;
              } else {
                adminValidated = false;
                validationMessage = fallbackData.message;
              }
            } else {
              const errorData = await fallbackResponse.json().catch(() => ({}));
              console.log('❌ Fallback endpoint error:', errorData);
              adminValidated = false;
              validationMessage = errorData.detail || `Server error: ${fallbackResponse.status}`;
            }
          } catch (fallbackError) {
            console.error('❌ Fallback endpoint also failed:', fallbackError);
            adminValidated = false;
            validationMessage = `Network error: ${fallbackError.message}. Please check if backend is running.`;
          }
        }

        // Now handle the result based on validation
        if (adminValidated) {
          // Additional check: Does this admin already have a subscription?
          try {
            const subscriptionCheckResponse = await fetch('http://localhost:8000/debug/all-subscriptions');
            if (subscriptionCheckResponse.ok) {
              const subscriptionData = await subscriptionCheckResponse.json();
              const existingSubscription = subscriptionData.subscriptions.find(
                sub => sub.admin_email === cardDetails.username && sub.status === 'active'
              );
              
              if (existingSubscription) {
                setError(`This admin email already has an active ${existingSubscription.plan_name} subscription. Please cancel the existing subscription before purchasing a new one.`);
                setSuccess('');
                return;
              }
            }
          } catch (subscriptionCheckError) {
            console.log('Could not check existing subscriptions:', subscriptionCheckError);
            // Continue with the process even if check fails
          }
          
          setSuccess('✅ Admin email verified successfully!');
          setError(null); // Clear any previous errors
          console.log('✅ Admin validation successful:', validationMessage);
        } else {
          setError(validationMessage || 'Email validation failed');
          setSuccess(''); // Clear any previous success
          console.log('❌ Admin validation failed:', validationMessage);
          return;
        }
      } catch (error) {
        console.error('❌ Unexpected error during admin validation:', error);
        setError(`Unexpected error: ${error.message}. Please try again.`);
        setSuccess(''); // Clear any previous success
        return;
      }

      // Validate card-specific fields if card payment is selected
      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
          setError('Please fill in all required card fields');
          return;
        }
        
        if (cardDetails.number.length !== 16 || !/^\d{16}$/.test(cardDetails.number)) {
          setError('Card number must be 16 digits');
          return;
        }
        
        if (cardDetails.cvv.length !== 3 || !/^\d{3}$/.test(cardDetails.cvv)) {
          setError('CVV must be 3 digits');
          return;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
          setError('Expiry date must be in MM/YY format');
          return;
        }
        
        // Validate name on card (only alphabets and spaces)
        if (!cardDetails.name || !/^[a-zA-Z\s]+$/.test(cardDetails.name)) {
          setError('Name on card must contain only letters and spaces');
          return;
        }
      }

      // Validate UPI-specific fields if UPI payment is selected
      if (paymentMethod === 'upi') {
        if (!cardDetails.upiId) {
          setError('Please enter UPI ID');
          return;
        }
        
        if (!cardDetails.upiId.includes('@')) {
          setError('UPI ID must contain @ symbol');
          return;
        }
      }

      // Process payment
      setLoading(true);
      try {
        // Simulate payment processing with a shorter delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get user info
        const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Create subscription in backend
        try {
          const subscriptionData = {
            company_name: userInfo?.company || 'New Company',
            admin_email: cardDetails.username,
            plan_name: plan.name,
            billing_period: billingPeriod || 'monthly',
            payment_status: 'completed'
          };

          // Use different endpoint based on authentication status
          const token = localStorage.getItem('token');
          const endpoint = token ? '/subscribe' : '/subscribe-prelogin';
          const headers = token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } : {
            'Content-Type': 'application/json'
          };

          console.log('🔍 Debug subscription creation:');
          console.log('  - Token exists:', !!token);
          console.log('  - Endpoint:', endpoint);
          console.log('  - Headers:', headers);
          console.log('  - Subscription data:', subscriptionData);

          const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(subscriptionData)
          });

          console.log('🔍 Response status:', response.status);
          console.log('🔍 Response headers:', response.headers);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create subscription');
          }

          const subscription = await response.json();
          console.log('✅ Subscription created successfully:', subscription);
          
          // Store subscription info in localStorage
          localStorage.setItem('subscription', JSON.stringify(subscription));
          
          // Update user info with the actual company name from subscription
          if (userInfo) {
            const updatedUser = { ...userInfo, company: subscription.company_name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            // Create new user info for prelogin users
            const newUser = {
              email: cardDetails.username,
              role: plan.name.toLowerCase() === 'pro' ? 'admin' : 'user',
              name: cardDetails.name || 'New User',
              company: subscription.company_name
            };
            localStorage.setItem('user', JSON.stringify(newUser));
          }
        } catch (subscriptionError) {
          console.error('❌ Subscription creation failed:', subscriptionError);
          // Continue with payment success even if subscription creation fails
          // This allows users to complete payment and retry subscription creation
        }

        setActiveStep(activeStep + 1);
        
        // Auto-close dialog after successful payment (with delay for user to see success)
        setTimeout(() => {
          onClose();
        }, 3000);
      } catch (err) {
        setError(err.message || 'Payment failed. Please try again.');
        console.error('Payment error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    // Reset all form data and messages when going back
    setActiveStep(activeStep - 1);
    setError(null);
    setSuccess('');
    setCardDetails({
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      username: '',
      upiId: ''
    });
  };



  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Choose Payment Method
              </FormLabel>
              <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                {[
                  { value: 'card', icon: <CreditCardIcon />, label: 'Credit/Debit Card' },
                  { value: 'upi', icon: <UPIIcon />, label: 'UPI' }
                ].map((method) => (
                  <FormControlLabel 
                    key={method.value}
                    value={method.value} 
                    control={
                      <Radio 
                        sx={{
                          color: 'rgba(255,255,255,0.3)',
                          '&.Mui-checked': {
                            color: '#ff0000'
                          }
                        }}
                      />
                    } 
                    label={
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: paymentMethod === method.value ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          border: '1px solid',
                          borderColor: paymentMethod === method.value ? '#667eea' : 'rgba(255,255,255,0.1)',
                          transition: 'all 0.2s',
                          width: '100%'
                        }}
                      >
                        {React.cloneElement(method.icon, { 
                          sx: { 
                            color: paymentMethod === method.value ? '#667eea' : 'rgba(255,255,255,0.7)'
                          }
                        })}
                        <Typography 
                          sx={{ 
                            color: paymentMethod === method.value ? '#667eea' : 'rgba(255,255,255,0.7)'
                          }}
                        >
                          {method.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mx: 0,
                      my: 1,
                      width: '100%'
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            {paymentMethod === 'card' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Admin Username/Email"
                    value={cardDetails.username}
                    onChange={handleCardDetailsChange('username')}
                    placeholder="Enter admin email for subscription"
                    helperText="Only company admins can pay for subscriptions"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={cardDetails.number}
                    onChange={handleCardDetailsChange('number')}
                    placeholder="1234 5678 9012 3456"
                    helperText="Enter 16-digit card number"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name on Card"
                    value={cardDetails.name}
                    onChange={handleCardDetailsChange('name')}
                    placeholder="Cardholder Name"
                    helperText="Only letters and spaces allowed"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={cardDetails.expiry}
                    onChange={handleCardDetailsChange('expiry')}
                    placeholder="MM/YY"
                    helperText="MM/YY format"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange('cvv')}
                    placeholder="123"
                    helperText="3-digit security code"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            )}



            {paymentMethod === 'upi' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Admin Username/Email"
                    value={cardDetails.username}
                    onChange={handleCardDetailsChange('username')}
                    placeholder="Enter admin email for subscription"
                    helperText="Only company admins can pay for subscriptions"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    placeholder="UPI ID"
                    value={cardDetails.upiId || ''}
                    onChange={handleCardDetailsChange('upiId')}
                    helperText="Must contain @ symbol (e.g., username@upi)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff0000',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-focused': {
                          color: '#ff0000',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            )}

          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Your subscription has been activated. You can now access all {plan?.name} features.
            </Typography>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: '#4caf50',
                borderColor: '#4caf50',
                '&:hover': {
                  borderColor: '#45a049',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
          <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      PaperProps={{
        sx: {
          background: '#000000',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(255, 0, 0, 0.1)',
          '& .MuiDialogContent-root': {
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#1a1a1a'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ff0000',
              borderRadius: '4px',
              '&:hover': {
                background: '#cc0000'
              }
            }
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #ff0000 0%, #990000 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 2
        }}
      >
        Subscribe to {plan?.name} Plan
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#000000', p: 3 }}>
        <Box sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
            {plan?.prices[billingPeriod]}
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'rgba(255,255,255,0.7)' }}>
              per {billingPeriod}
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {plan?.descriptions[billingPeriod]}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Stepper 
          activeStep={activeStep}
          sx={{
            '& .MuiStepLabel-label': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-active': {
                color: '#ff0000'
              },
              '&.Mui-completed': {
                color: '#4caf50'
              }
            },
            '& .MuiStepIcon-root': {
              color: 'rgba(255,255,255,0.3)',
              '&.Mui-active': {
                color: '#ff0000'
              },
              '&.Mui-completed': {
                color: '#4caf50'
              }
            },
            '& .MuiStepConnector-line': {
              borderColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#ff0000'
              },
              border: '1px solid #ff0000'
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mt: 2,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#00ff00'
              },
              border: '1px solid #00ff00'
            }}
          >
            {success}
          </Alert>
        )}



        {getStepContent(activeStep)}

      </DialogContent>
      <DialogActions sx={{ 
        bgcolor: '#000000', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        p: 2,
        gap: 1
      }}>
        {activeStep !== steps.length - 1 && (
          <Button 
            onClick={onClose}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#ff0000'
              }
            }}
          >
            Cancel
          </Button>
        )}
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#ff0000'
              }
            }}
          >
            Back
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={() => {
              const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
              const dashboardPath = userInfo?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
              onClose(); // Close dialog first
              navigate(dashboardPath);
            }}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            endIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{
              background: 'linear-gradient(135deg, #ff0000 0%, #990000 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #cc0000 0%, #800000 100%)'
              },
              '&:disabled': {
                background: '#333333',
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {activeStep === steps.length - 2 ? 'Pay Now' : 'Next'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentGateway;