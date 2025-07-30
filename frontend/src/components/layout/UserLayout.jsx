import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Badge, Chip, useTheme, useMediaQuery, CssBaseline, SpeedDial, SpeedDialAction, SpeedDialIcon, Fab, Tooltip, Grid, Card, Dialog, Skeleton
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon, Dashboard, Upload, Assessment, Notifications, Assessment as ReportsIcon, CreditCard, Settings, AccountCircle, Logout, ChevronLeft, ChevronRight, Search, Help, Apps, Close
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import UserCSVUpload from '../../pages/user/CSVUpload';
import ChatBot from '../ChatBot';
import UserProfile from '../../pages/user/UserProfile';

const drawerWidth = 280;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
      sidebar: '#1c1214',
      appbar: '#1a1113',
    },
    primary: { main: '#b71c1c', dark: '#7f0000', light: '#f05545', contrastText: '#fff' },
    secondary: { main: '#ff5252', dark: '#c50e29', light: '#ff867f', contrastText: '#fff' },
    error: { main: '#d32f2f' },
    warning: { main: '#ff9800' },
    info: { main: '#ff1744' },
    success: { main: '#43a047' },
    text: { primary: '#fff', secondary: '#ffb3b3' },
    divider: 'rgba(255,255,255,0.12)',
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: '#1c1214', color: '#fff' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#1a1113' } } },
    MuiCard: { styleOverrides: { root: { backgroundColor: '#1a1a1a', color: '#fff' } } },
    MuiListItemButton: { styleOverrides: { root: { '&.Mui-selected': { backgroundColor: '#b71c1c', color: '#fff', '&:hover': { backgroundColor: '#7f0000' } } } } },
  },
});

const UserLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    apiService.getCurrentUser().then(
      (data) => { if (mounted) { setUser(data); setUserLoading(false); } },
      () => { if (mounted) setUserLoading(false); }
    );
    return () => { mounted = false; };
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/user/dashboard', description: 'Overview and analytics' },
    { text: 'CSV Upload', icon: <Upload />, path: '/user/csv-upload', description: 'Upload threat data' },
    { text: 'Threat Visualization', icon: <Assessment />, path: '/user/visualization', description: 'Visualize threats' },
    { text: 'Profile', icon: <AccountCircle />, path: '/user/profile', description: 'User profile' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const handleAppDrawerToggle = () => setAppDrawerOpen(!appDrawerOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { navigate('/login'); };
  const handleProfileOpen = () => {
    setProfileOpen(true);
    setAnchorEl(null);
  };

  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, minHeight: 64, background: 'rgba(26,26,26,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1.5px solid rgba(255,255,255,0.10)', boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1.5, background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', textShadow: '0 2px 12px rgba(183,28,28,0.18)' }}>
          NetAegis User
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.10)', mb: 1 }} />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{ mx: 1, my: 0.5, borderRadius: 2.5, px: 2.5, py: 1.2, boxShadow: location.pathname === item.path ? '0 4px 16px 0 rgba(255,82,82,0.10)' : 'none', background: location.pathname === item.path ? 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)' : 'rgba(255,255,255,0.04)', color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: location.pathname === item.path ? 'bold' : 500, transition: 'all 0.22s cubic-bezier(.4,2,.6,1)', '&:hover': { background: 'linear-gradient(90deg, #ff5252 0%, #b71c1c 100%)', color: '#fff', boxShadow: '0 8px 24px 0 rgba(255,82,82,0.13)', transform: 'translateY(-2px) scale(1.03)', '& .MuiListItemIcon-root': { color: '#fff', filter: 'drop-shadow(0 0 8px #ff5252)' } }, '& .MuiListItemIcon-root': { color: location.pathname === item.path ? '#fff' : '#ff5252', filter: location.pathname === item.path ? 'drop-shadow(0 0 8px #ff5252)' : 'none', transition: 'all 0.22s cubic-bezier(.4,2,.6,1)', minWidth: 40, }, }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal', sx: { letterSpacing: 0.5, background: location.pathname === item.path ? 'linear-gradient(90deg, #fff 0%, #ffeaea 100%)' : 'none', backgroundClip: location.pathname === item.path ? 'text' : 'none', WebkitBackgroundClip: location.pathname === item.path ? 'text' : 'none', WebkitTextFillColor: location.pathname === item.path ? 'transparent' : 'inherit', } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: darkTheme.palette.background.default }}>
        <CssBaseline />
        {/* AppBar with user avatar/profile menu */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: darkTheme.palette.background.appbar }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1.5 }}>
              NetAegis
            </Typography>
            <Tooltip title="Account">
              <IconButton color="inherit" onClick={handleProfileMenuOpen} size="large">
                <Avatar sx={{ bgcolor: '#b71c1c' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
              <MenuItem disabled>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#b71c1c', mr: 1 }}><AccountCircle /></Avatar>
                  <Box>
                    {userLoading ? (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold"><Skeleton width={80} /></Typography>
                        <Typography variant="body2" color="text.secondary"><Skeleton width={120} /></Typography>
                        <Typography variant="caption" color="text.secondary"><Skeleton width={60} /></Typography>
                      </>
                    ) : user ? (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'N/A'}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold">Unknown</Typography>
                        <Typography variant="body2" color="text.secondary">unknown@email.com</Typography>
                        <Typography variant="caption" color="text.secondary">Normal User</Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileOpen}>
                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1.5px solid rgba(255,255,255,0.10)' } }}
        >
          {drawer}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 0, minHeight: '100vh', background: darkTheme.palette.background.default, mt: 8 }}>
          {children}
        </Box>
        <ChatBot />
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
          <UserProfile />
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default UserLayout; 