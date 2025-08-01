import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  Fade,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Security,
  Send,
  Chat,
  Help,
  Info
} from '@mui/icons-material';

const UserChatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your security assistant. I can help you with questions about network security, threat detection, and how to use NetAegis. What would you like to know?',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: chatHistory.length + 1,
      type: 'user',
      text: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatHistory.length + 2,
        type: 'bot',
        text: getBotResponse(message),
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('threat') || lowerMessage.includes('attack')) {
      return 'Threats can include DDoS attacks, malware, phishing attempts, and unauthorized access. NetAegis uses machine learning to detect these threats in your network data. Upload your CSV files to start threat detection!';
    } else if (lowerMessage.includes('upload') || lowerMessage.includes('csv')) {
      return 'To upload CSV files, go to the CSV Upload section. Make sure your file contains network traffic data with columns like source/destination ports, protocols, and connection states. The system will automatically analyze it for threats.';
    } else if (lowerMessage.includes('visualization') || lowerMessage.includes('chart')) {
      return 'The Threat Visualization section shows interactive charts and graphs of your network data. You can see threat patterns, connection distributions, and security metrics. It helps you understand your network security posture.';
    } else if (lowerMessage.includes('report') || lowerMessage.includes('analysis')) {
      return 'Reports are generated automatically when you upload and analyze data. They include threat summaries, detection accuracy, and security recommendations. Check the Reports section to view your analysis results.';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I can help you with: uploading CSV files, understanding threat detection, viewing visualizations, generating reports, and managing your security settings. What specific topic would you like to learn more about?';
    } else {
      return 'I\'m here to help with your security questions! You can ask me about threat detection, uploading data, viewing reports, or any other NetAegis features.';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
              Security Assistant
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ask questions about network security, threat detection, and NetAegis features
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Chat Interface */}
            <Grid xs={12} md={8}>
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
                    <Chat sx={{ color: '#b71c1c', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Chat with Security Assistant
                    </Typography>
                  </Box>
                  
                  {/* Chat History */}
                  <Box sx={{ 
                    height: '400px', 
                    overflowY: 'auto', 
                    mb: 3,
                    p: 2,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 2
                  }}>
                    {chatHistory.map((chat) => (
                      <Box key={chat.id} sx={{ mb: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: chat.type === 'user' ? 'flex-end' : 'flex-start',
                          mb: 1
                        }}>
                          <Paper sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: chat.type === 'user' ? '#b71c1c' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            borderRadius: 2
                          }}>
                            <Typography variant="body2">
                              {chat.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {chat.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Message Input */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Ask a question about security..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255,255,255,0.5)',
                          opacity: 1,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      sx={{
                        background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7f0000 0%, #c50e29 100%)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.1)',
                        },
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      <Send />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Help Section */}
            <Grid xs={12} md={4}>
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
                    <Help sx={{ color: '#b71c1c', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Quick Help
                    </Typography>
                  </Box>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Info sx={{ color: '#2196f3' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Threat Detection"
                        secondary="Ask about DDoS, malware, and other threats"
                        sx={{ 
                          '& .MuiListItemText-primary': { color: 'white' },
                          '& .MuiListItemText-secondary': { color: 'text.secondary' }
                        }}
                      />
                    </ListItem>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <ListItem>
                      <ListItemIcon>
                        <Security sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Data Upload"
                        secondary="Learn how to upload CSV files"
                        sx={{ 
                          '& .MuiListItemText-primary': { color: 'white' },
                          '& .MuiListItemText-secondary': { color: 'text.secondary' }
                        }}
                      />
                    </ListItem>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <ListItem>
                      <ListItemIcon>
                        <Chat sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reports & Analysis"
                        secondary="Understand your security reports"
                        sx={{ 
                          '& .MuiListItemText-primary': { color: 'white' },
                          '& .MuiListItemText-secondary': { color: 'text.secondary' }
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default UserChatbot; 