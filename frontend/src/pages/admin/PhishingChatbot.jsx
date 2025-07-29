
import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Box, Avatar, TextField, IconButton, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";



const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome! Ask any question or paste a link to check for phishing.", type: "info" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/phishing-check", { user_input: input });
      let botMsg = res.data.message;
      setMessages((msgs) => [...msgs, { role: "assistant", content: botMsg }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  // Sidebar width (adjust as needed for your layout)
  const SIDEBAR_WIDTH = 260;
  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#18191a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
      {/* Header Bar */}
      <Box sx={{
        width: '100vw',
        py: 2,
        px: 0,
        pl: `${SIDEBAR_WIDTH}px`,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1.5px solid #ff0000',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: '#18191a',
        mb: 0,
      }}>
        <Avatar sx={{ bgcolor: '#18191a', border: '1.5px solid #ff0000', mr: 1.5, width: 44, height: 44 }}>
          <SmartToyIcon fontSize="medium" sx={{ color: '#ff0000' }} />
        </Avatar>
        <Typography variant="h6" fontWeight={700} color="#fff" letterSpacing={1.2} sx={{ textShadow: '0 1px 4px #000' }}>
          NetAegis Chatbot
        </Typography>
      </Box>
      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          width: '100vw',
          px: 3,
          pl: `${SIDEBAR_WIDTH + 24}px`,
          pt: 3,
          pb: 12,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            display="flex"
            justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}
            alignItems="flex-end"
            mb={2.2}
            sx={{
              opacity: 0,
              transform: msg.role === "user" ? "scale(0.95) translateY(20px)" : "scale(0.95) translateY(-20px)",
              animation: `bubblePop 0.5s cubic-bezier(.23,1.12,.32,1) forwards`,
              animationDelay: `${i * 0.07}s`,
              pl: msg.role === 'assistant' ? 24 : 0,
              pr: msg.role === 'user' ? 24 : 0,
            }}
          >
            {msg.role === "assistant" && (
              <Avatar
                sx={{
                  bgcolor: '#18191a',
                  border: '1.5px solid #ff0000',
                  width: 28,
                  height: 28,
                  mr: 1,
                }}
              >
                <SmartToyIcon fontSize="small" sx={{ color: '#ff0000' }} />
              </Avatar>
            )}
            <Box
              sx={{
                bgcolor: msg.role === "user" ? '#232425' : '#18191a',
                color: msg.role === "user" ? '#fff' : '#ffb3b3',
                border: '1.5px solid #ff0000',
                borderRadius: msg.role === "user"
                  ? '18px 18px 5px 18px'
                  : '18px 18px 18px 5px',
                px: 2.2,
                py: 1.2,
                maxWidth: '68vw',
                fontSize: 16,
                fontWeight: 500,
                wordBreak: 'break-word',
                transition: 'background 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
                '&:hover': {
                  background: '#232425',
                },
              }}
              tabIndex={0}
              title={msg.content.length > 60 ? msg.content : undefined}
            >
              {msg.content}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box textAlign="center" color="#ff0000" mt={2}>
            <CircularProgress size={22} sx={{ color: '#ff0000' }} />
          </Box>
        )}
        <style>{`
          @keyframes bubblePop {
            0% {
              opacity: 0;
              transform: scale(0.7) translateY(30px);
            }
            60% {
              opacity: 1;
              transform: scale(1.05) translateY(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </Box>
      {/* Sticky Input Bar */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          width: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          px: 3,
          py: 2,
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          position: 'fixed',
          bottom: 0,
          left: `${SIDEBAR_WIDTH}px`,
          bgcolor: '#18191a',
          borderTop: '1.5px solid #ff0000',
          zIndex: 20,
          alignItems: 'center',
        }}
      >
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message or paste a link..."
          variant="outlined"
          size="small"
          sx={{
            bgcolor: '#232425',
            borderRadius: 2,
            input: { 
              color: '#fff', 
              fontSize: 15, 
              fontWeight: 500, 
              py: 1.5, 
              px: 2 
            },
            '& .MuiOutlinedInput-root': {
              border: '1.5px solid #ff0000',
              '&:hover': {
                border: '1.5px solid #ff3333',
              },
              '&.Mui-focused': {
                border: '1.5px solid #ff6666',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': { 
              border: 'none' 
            },
            width: '60%',
            minWidth: 300,
            maxWidth: 500,
          }}
          disabled={loading}
          autoFocus
        />
        <IconButton
          type="submit"
          color="error"
          disabled={loading || !input.trim()}
          size="medium"
          sx={{
            bgcolor: '#ff0000',
            color: '#fff',
            border: '1.5px solid #ff0000',
            borderRadius: 2,
            '&:hover': { 
              bgcolor: '#ff3333',
              border: '1.5px solid #ff3333'
            },
            '&:disabled': {
              bgcolor: '#666',
              border: '1.5px solid #666',
              color: '#999'
            },
            transition: 'all 0.3s ease',
            width: 48,
            height: 48,
            flexShrink: 0,
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chatbot;
