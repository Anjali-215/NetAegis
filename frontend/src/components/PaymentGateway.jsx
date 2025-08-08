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
    cvv: ''
  });

  const steps = ['Select Payment Method', 'Enter Details', 'Confirm Payment'];

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardDetailsChange = (field) => (event) => {
    setCardDetails({ ...cardDetails, [field]: event.target.value });
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      // Process payment
      setLoading(true);
      try {
        // Simulate payment processing with a shorter delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get user info
        const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (!userInfo) {
          throw new Error('User not found');
        }

        // Simulate successful payment without API calls
        const newRole = plan.name.toLowerCase() === 'pro' ? 'admin' : 'user';

        // Update local storage with new role
        const updatedUser = { ...userInfo, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));

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
                  { value: 'upi', icon: <UPIIcon />, label: 'UPI' },
                  { value: 'netbanking', icon: <BankIcon />, label: 'Net Banking' }
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
                    label="Card Number"
                    value={cardDetails.number}
                    onChange={handleCardDetailsChange('number')}
                    placeholder="1234 5678 9012 3456"
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
                    label="CVV"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange('cvv')}
                    placeholder="123"
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
            {paymentMethod === 'upi' && (
              <TextField
                fullWidth
                label="UPI ID"
                placeholder="username@upi"
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
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
            )}
            {paymentMethod === 'netbanking' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>
                  Select your bank to proceed with Net Banking
                </Typography>
                <Grid container spacing={2}>
                  {['SBI', 'HDFC', 'ICICI', 'Axis'].map((bank) => (
                    <Grid item xs={6} key={bank}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<BankIcon />}
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            borderColor: '#ff0000',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            color: '#ff0000'
                          }
                        }}
                      >
                        {bank} Bank
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
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
        {activeStep > 0 && activeStep !== steps.length - 1 && (
          <Button 
            onClick={handleBack}
            sx={{ color: 'text.secondary' }}
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