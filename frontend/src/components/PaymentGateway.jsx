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

  // Only check admin role if user is logged in (for admin pages)
  // If not logged in (prelogin page), allow payment dialog to stay open
  React.useEffect(() => {
    if (open && isLoggedIn && !isAdmin) {
      setError('Only company admins can manage subscriptions. Please contact your administrator.');
      setTimeout(() => {
        onClose();
        setError(null);
      }, 3000);
    }
  }, [open, isLoggedIn, isAdmin, onClose]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setActiveStep(0);
      setPaymentMethod('card');
      setError(null);
      setCardDetails({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        username: '',
        upiId: ''
      });
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

      // Validate card-specific fields if card payment is selected
      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
          setError('Please fill in all required card fields');
          return;
        }
        
        // Validate card number length
        if (cardDetails.number.length !== 16) {
          setError('Card number must be 16 digits');
          return;
        }
        
        // Validate CVV length
        if (cardDetails.cvv.length !== 3) {
          setError('CVV must be 3 digits');
          return;
        }
        
        // Validate expiry format
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
          setError('Expiry date must be in MM/YY format');
          return;
        }
      }

      // Validate UPI-specific fields if UPI payment is selected
      if (paymentMethod === 'upi') {
        if (!cardDetails.upiId) {
          setError('Please enter UPI ID');
          return;
        }
        
        // Validate UPI ID contains @ symbol
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
        
        // For prelogin users, create a basic user structure
        if (!userInfo) {
          // This is a new user signing up, create basic user info
          const newUser = {
            email: cardDetails.username || 'newuser@example.com',
            role: plan.name.toLowerCase() === 'pro' ? 'admin' : 'user',
            name: cardDetails.name || 'New User',
            company: 'New Company'
          };
          localStorage.setItem('user', JSON.stringify(newUser));
        } else {
          // Existing user, update their role
          const newRole = plan.name.toLowerCase() === 'pro' ? 'admin' : 'user';
          const updatedUser = { ...userInfo, role: newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setActiveStep(activeStep + 1);
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
    setActiveStep(activeStep - 1);
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
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Your subscription has been activated. You can now access all {plan?.name} features.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={activeStep === steps.length - 1 ? onClose : undefined}
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