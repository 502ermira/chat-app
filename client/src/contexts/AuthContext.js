import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../api';
import Loader from '../components/Loader/Loader';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setUser({ id: decodedToken.id, username: decodedToken.username, email: decodedToken.email });
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await API.get('/auth/verify-token', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          login(storedToken);
          console.log('AuthProvider - User authenticated');
        } catch (error) {
          console.error('AuthProvider - Token verification failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    if (!user && token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading ? children : 
        <p className='loader'></p>
      }
    </AuthContext.Provider>
  );
};
