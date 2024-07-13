import React, { useState, useEffect } from 'react';
import API from '../../api';
import './UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/auth/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({ username: data.username, email: data.email, password: '', confirmPassword: '' });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setEditing(true);
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await API.put(
        '/auth/users/me',
        { username: userData.username, email: userData.email, password: userData.password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditing(false);
      setMessage(data.message);
      setError('');
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(error.response?.data?.message || 'Error updating user data');
      setMessage('');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage('');
    setError('');
  };

  return (
    <div className="user-profile">
      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}
      {editing ? (
        <div>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
          </label>
          <label>
            New Password:
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
            />
          </label>
          <label>
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
            />
          </label>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email}</p>
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
