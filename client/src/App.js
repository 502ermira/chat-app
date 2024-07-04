import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import { SocketProvider } from './contexts/SocketContext';
import API from './api';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await API.get('/auth/verify-token', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/chat/:friendId" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
