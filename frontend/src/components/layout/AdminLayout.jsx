import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  CssBaseline,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Tooltip,
  Grid,
  Card,
  Dialog
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Upload,
  Assessment,
  Security,
  Notifications,
  Assessment as ReportsIcon,
  CreditCard,
  Settings,
  AccountCircle,
  Logout,
  ChevronLeft,
  ChevronRight,
  Search,
  Help,
  Apps,
  Close
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from '../../pages/admin/Profile';
import apiService from '../../services/api';
import mainlogo from '../../assets/mainlogo.svg';

const drawerWidth = 280;

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a', // darker background
      paper: '#1a1a1a',   // slightly lighter dark
      sidebar: '#1c1214',
      appbar: '#1a1113',
    },
    primary: {
      main: '#b71c1c', // strong red
      dark: '#7f0000',
      light: '#f05545',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff5252', // accent red
      dark: '#c50e29',
      light: '#ff867f',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#ff1744',
    },
    success: {
      main: '#43a047',
    },
    text: {
      primary: '#fff',
      secondary: '#ffb3b3',
    },
    divider: 'rgba(255,255,255,0.12)',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1c1214',
          color: '#fff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1113',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#fff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#b71c1c',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#7f0000',
            },
          },
        },
      },
    },
  },
});

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
      description: 'Overview and analytics'
    },
    {
      text: 'User Management',
      icon: <People />,
      path: '/admin/users',
      description: 'Manage system users'
    },
    {
      text: 'CSV Upload',
      icon: <Upload />,
      path: '/admin/csv-upload',
      description: 'Upload threat data'
    },
    {
      text: 'Threat Visualization',
      icon: <Assessment />,
      path: '/admin/threat-visualization',
      description: 'Visualize threats'
    },
    {
      text: 'Detection Logs',
      icon: <Security />,
      path: '/admin/detection-logs',
      description: 'View detection history'
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/admin/notifications',
      description: 'System notifications'
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/admin/reports',
      description: 'Generate reports'
    },
    {
      text: 'Subscription',
      icon: <CreditCard />,
      path: '/admin/subscription',
      description: 'Manage subscriptions'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/admin/settings',
      description: 'System settings'
    },
    {
      text: 'Chatbot',
      icon: <Security />,
      path: '/admin/phishing-chatbot',
      description: 'Ask questions or check links'
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAppDrawerToggle = () => {
    setAppDrawerOpen(!appDrawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear token and user data
    apiService.removeToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          minHeight: 64,
          background: 'rgba(26,26,26,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(255,255,255,0.10)',
          boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
        }}
      >
        <img 
          src={mainlogo} 
          alt="NetAegis" 
          style={{ 
            height: '32px', 
            width: 'auto',
            marginRight: '12px'
          }} 
        />
        <Typography variant="h6" sx={{
          fontWeight: 'bold',
          letterSpacing: 1.5,
          background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(183,28,28,0.18)',
        }}>
          NetAegis Admin
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.10)', mb: 1 }} />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2.5,
                px: 2.5,
                py: 1.2,
                boxShadow: location.pathname === item.path ? '0 4px 16px 0 rgba(255,82,82,0.10)' : 'none',
                background: location.pathname === item.path
                  ? 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)'
                  : 'rgba(255,255,255,0.04)',
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.85)',
                fontWeight: location.pathname === item.path ? 'bold' : 500,
                transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)',
                  color: '#fff',
                  boxShadow: '0 8px 24px 0 rgba(255,82,82,0.13)',
                  transform: 'translateY(-2px) scale(1.03)',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                    filter: 'drop-shadow(0 0 8px #ff5252)'
                  }
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? '#fff' : '#ff5252',
                  filter: location.pathname === item.path ? 'drop-shadow(0 0 8px #ff5252)' : 'none',
                  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  sx: {
                    letterSpacing: 0.5,
                    background: location.pathname === item.path ? 'linear-gradient(90deg, #fff 0%, #ffeaea 100%)' : 'none',
                    backgroundClip: location.pathname === item.path ? 'text' : 'none',
                    WebkitBackgroundClip: location.pathname === item.path ? 'text' : 'none',
                    WebkitTextFillColor: location.pathname === item.path ? 'transparent' : 'inherit',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const appDrawer = (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      background: 'rgba(26,26,26,0.7)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderLeft: '1.5px solid rgba(255,255,255,0.12)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
      display: 'flex',
      flexDirection: 'column',
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden',
      position: 'relative',
      maxWidth: 400,
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: 1.5,
          textShadow: '0 2px 12px rgba(183,28,28,0.25)',
          background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Quick Access
        </Typography>
        <IconButton onClick={handleAppDrawerToggle} sx={{ color: 'white', background: 'rgba(255,255,255,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', ml: 1, '&:hover': { background: 'rgba(255,82,82,0.18)' } }}>
          <Close sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
      <Grid container spacing={2}>
        {menuItems.map((item) => (
          <Grid item xs={6} sm={4} key={item.text}>
            <Card
              onClick={() => {
                navigate(item.path);
                setAppDrawerOpen(false);
              }}
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                background: location.pathname === item.path
                  ? 'linear-gradient(135deg, #ff5252 0%, #b71c1c 100%)'
                  : 'linear-gradient(135deg, rgba(255,82,82,0.10) 0%, rgba(26,26,26,0.7) 100%)',
                color: 'white',
                borderRadius: 3,
                border: location.pathname === item.path ? '2px solid #ff5252' : '1.5px solid rgba(255,255,255,0.10)',
                boxShadow: location.pathname === item.path ? '0 4px 16px 0 rgba(255,82,82,0.18)' : '0 1px 6px 0 rgba(0,0,0,0.10)',
                transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                position: 'relative',
                overflow: 'visible',
                minHeight: 90,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.04)',
                  boxShadow: '0 8px 24px 0 rgba(255,82,82,0.13)',
                  background: 'linear-gradient(135deg, #ff5252 0%, #b71c1c 100%)',
                  border: '2px solid #ff5252',
                },
              }}
            >
              <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'center' }}>
                {React.cloneElement(item.icon, {
                  sx: {
                    fontSize: 28,
                    color: location.pathname === item.path ? '#fff' : '#ff5252',
                    filter: location.pathname === item.path ? 'drop-shadow(0 0 8px #ff5252)' : 'drop-shadow(0 0 3px #b71c1c)',
                    transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  }
                })}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', letterSpacing: 0.5, background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 14 }}>
                {item.text}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', background: darkTheme.palette.background.default, minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
            ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
            background: darkTheme.palette.background.appbar,
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'width 0.3s ease, margin-left 0.3s ease'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Admin Panel'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <Search />
              </IconButton>
              
              <IconButton color="inherit">
                <Help />
              </IconButton>
              
              <Badge badgeContent={3} color="error">
                <IconButton color="inherit" onClick={() => navigate('/admin/notifications')}>
                  <Notifications />
                </IconButton>
              </Badge>
              
              <IconButton
                color="inherit"
                aria-label="profile"
                onClick={() => setProfileOpen(true)}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* FAB for Quick Access (moved before sidebar in DOM) */}
        <Fab
          color="primary"
          aria-label="quick access"
          onClick={handleAppDrawerToggle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #c50e29 0%, #8f0000 100%)',
            },
            zIndex: 1000
          }}
        >
          <Apps />
        </Fab>
        
        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: sidebarOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                background: 'rgba(26,26,26,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#fff',
                borderRight: '1.5px solid rgba(255,255,255,0.10)',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: sidebarOpen ? drawerWidth : 0,
                background: 'rgba(26,26,26,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#fff',
                borderRight: '1.5px solid rgba(255,255,255,0.10)',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
                overflow: 'hidden',
                transition: 'width 0.3s ease',
              },
            }}
            open={sidebarOpen}
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
            mt: '64px',
            background: darkTheme.palette.background.default,
            minHeight: '100vh',
            color: darkTheme.palette.text.primary,
            transition: 'width 0.3s ease',
            // Responsive centering and padding when sidebar is closed
            px: { xs: 1, sm: sidebarOpen ? 3 : 6, md: sidebarOpen ? 4 : 10, lg: sidebarOpen ? 6 : 16 },
            maxWidth: sidebarOpen ? '100%' : '1600px',
            mx: sidebarOpen ? 0 : 'auto',
          }}
        >
          {children}
        </Box>
        
        {/* App Drawer */}
        <Drawer
          anchor="right"
          open={appDrawerOpen}
          onClose={handleAppDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 400 },
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            },
          }}
        >
          {appDrawer}
        </Drawer>
        
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
          <Profile />
        </Dialog>
        
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout; 