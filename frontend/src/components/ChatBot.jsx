import React, { useState, useRef } from 'react';
import {
  Box, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, IconButton, Avatar, CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import mainlogo from '../assets/mainlogo.svg';

const BOT_NAME = 'NoBait';
const BOT_AVATAR = <Avatar sx={{ bgcolor: '#b71c1c' }}>N</Avatar>;
const USER_AVATAR = <Avatar sx={{ bgcolor: '#ff5252' }}>U</Avatar>;

const ChatBot = ({ open: controlledOpen, setOpen: setControlledOpen, hideFab }) => {
  const [open, setOpen] = React.useState(false);
  const isControlled = typeof controlledOpen === 'boolean' && typeof setControlledOpen === 'function';
  const actualOpen = isControlled ? controlledOpen : open;
  const actualSetOpen = isControlled ? setControlledOpen : setOpen;
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm ${BOT_NAME}, your anti-phishing assistant. Ask me about phishing or paste a link to check.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', { message: input });
      if (Array.isArray(res.data)) {
        setMessages(msgs => [...msgs, ...res.data]);
      } else {
        setMessages(msgs => [...msgs, { role: 'assistant', content: 'Sorry, I could not process your request.' }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'assistant', content: 'Error: ' + (err?.response?.data?.detail || err.message) }]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (actualOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [actualOpen, messages]);

  return (
    <>
      {!hideFab && (
        <Fab
          color="primary"
          aria-label="chatbot"
          onClick={() => actualSetOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 32 },
            right: { xs: 16, md: 32 },
            zIndex: 2000,
            background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
            color: '#fff',
            boxShadow: '0 4px 24px #d32f2f55',
          }}
        >
          <ChatIcon fontSize="large" />
        </Fab>
      )}
      <Dialog open={actualOpen} onClose={() => actualSetOpen(false)} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          background: '#18171c',
          color: '#fff',
          borderRadius: 3,
          border: '1.5px solid #d32f2f',
          boxShadow: '0 8px 32px #d32f2f22',
        }
      }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #d32f2f 0%, #18171c 100%)', color: '#fff', fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <img 
              src={mainlogo} 
              alt="NetAegis" 
              style={{ 
                height: '24px', 
                width: 'auto',
                marginRight: '8px'
              }} 
            />
            <ChatIcon sx={{ color: '#fff' }} />
            {BOT_NAME} Chat
          </Box>
          <IconButton onClick={() => actualSetOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 320, maxHeight: 420, overflowY: 'auto', background: '#18171c', p: 2 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} display="flex" alignItems="flex-start" mb={2}>
              {msg.role === 'assistant' ? BOT_AVATAR : USER_AVATAR}
              <Box ml={2} bgcolor={msg.role === 'assistant' ? '#23242b' : '#2a1a1a'} px={2} py={1.2} borderRadius={2} maxWidth="80%" boxShadow={msg.role === 'assistant' ? '0 2px 8px #d32f2f22' : '0 2px 8px #ff525222'}>
                <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{msg.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </DialogContent>
        <DialogActions sx={{ background: '#18171c', p: 2 }}>
          <TextField
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
            placeholder="Ask about phishing or paste a link..."
            fullWidth
            size="small"
            sx={{
              input: { color: '#fff', background: '#23242b', borderRadius: 2 },
              bgcolor: '#23242b',
              borderRadius: 2,
              mr: 1,
            }}
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 2px 8px #d32f2f22',
            }}
            disabled={loading || !input.trim()}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatBot; 