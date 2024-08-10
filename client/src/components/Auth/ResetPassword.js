import React, { useState } from 'react';
import API from '../../api';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await API.put(`/auth/reset-password/${token}`, { newPassword });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="reset-password-input"
        required
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="reset-password-input"
        required
      />
      <button type="submit" disabled={loading} className="reset-password-button">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p className="reset-password-message">{message}</p>}
    </form>
  );
};

export default ResetPassword;
