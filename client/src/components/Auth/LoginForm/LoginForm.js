import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data.token);
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
        required
      />
      <button type="submit" disabled={loading} className="login-button">
        {loading ? 'Loading...' : 'Login'}
      </button>
      {message && <p className="error-message">{message}</p>}
      <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
    </form>
  );
};

export default LoginForm;
