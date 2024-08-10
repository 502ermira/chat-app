import React, { useState } from 'react';
import API from '../../api'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="forgot-password-input"
        required
      />
      <button type="submit" disabled={loading} className="forgot-password-button">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      {message && <p className="forgot-password-message">{message}</p>}
    </form>
  );
};

export default ForgotPassword;
