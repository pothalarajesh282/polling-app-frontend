import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Home from './pages/Home';
import PollDetail from './pages/PollDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector(state => state.auth);
  const { mode } = useSelector(state => state.theme);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user && !isLoggedIn) {
      // User data is already in localStorage, Redux will handle it
    }

    // Generate user session for vote tracking
    if (!localStorage.getItem('userSession')) {
      localStorage.setItem('userSession', Math.random().toString(36).substring(2));
    }
  }, [dispatch, isLoggedIn]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poll/:id" element={<PollDetail />} />
          <Route 
            path="/login" 
            element={!isLoggedIn ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isLoggedIn ? <Register /> : <Navigate to="/" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;