import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Switch,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toggleTheme } from '../store/slices/themeSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector(state => state.auth);
  const { mode } = useSelector(state => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Polling App
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2">Light</Typography>
            <Switch
              checked={mode === 'dark'}
              onChange={handleThemeToggle}
              color="default"
            />
            <Typography variant="body2">Dark</Typography>
          </Box>

          {isLoggedIn ? (
            <>
              <Typography variant="body2">
                Welcome, {user?.username} {user?.role === 'admin' && '(Admin)'}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;