import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';
import mainlogo from '../assets/mainlogo.svg';
import { 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Divider,
  Box 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user session
    const userInfo = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    if (userInfo && token) {
      setUser(userInfo);
    }
  }, []);

  // Smooth scroll handler
  const handleNavClick = (e, selector) => {
    e.preventDefault();
    setOpen(false);

    // Use GSAP ScrollSmoother if available
    if (window.ScrollSmoother && window.ScrollSmoother.get && selector !== '#') {
      const el = document.querySelector(selector);
      if (el) {
        const smoother = window.ScrollSmoother.get();
        if (smoother) {
          // Offset by Navbar height (72px)
          const y = el.getBoundingClientRect().top + window.scrollY - 72;
          smoother.scrollTo(y, true);
          // Force GSAP to recalculate scroll area after scroll
          setTimeout(() => {
            smoother.refresh();
          }, 100);
          return;
        }
      }
    }
    if (selector === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <a href="#" className="navbar-logo" onClick={e => handleNavClick(e, '#')}>
          <img 
            src={mainlogo} 
            alt="NetAegis" 
            style={{ 
              height: '32px', 
              width: 'auto',
              marginRight: '8px'
            }} 
          />
        </a>
        <button className="navbar-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className="burger-bar" />
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>
        <div className={`navbar-menu${open ? ' open' : ''}`}>
          <ul className="navbar-links">
            <li><a href="#" onClick={e => handleNavClick(e, '#')}>Home</a></li>
            <li><a href="#features-section" onClick={e => handleNavClick(e, '.features-section')}>Features</a></li>
            <li><a href="#about" onClick={e => handleNavClick(e, '#about')}>About</a></li>
            <li><a href="#pricing-section" onClick={e => handleNavClick(e, '.pricing-section')}>Pricing</a></li>
            <li><a href="#contact-section" onClick={e => handleNavClick(e, '.contact-section')}>Contact</a></li>
            <li><a href="#faq-fab-section" onClick={e => handleNavClick(e, '.faq-fab-section')}>FAQ</a></li>
          </ul>
          <div className="navbar-auth-buttons">
              {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'red' }
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  onClick={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => {
                    const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
                    navigate(dashboardPath);
                  }}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => {
                    const profilePath = user?.role === 'admin' ? '/admin/profile' : '/user/profile';
                    navigate(profilePath);
                  }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => {
                    const settingsPath = user?.role === 'admin' ? '/admin/settings' : '/user/settings';
                    navigate(settingsPath);
                  }}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <>
                <Button variant="secondary" href="/login">Login</Button>
                <Button variant="primary" href="/signup">Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 