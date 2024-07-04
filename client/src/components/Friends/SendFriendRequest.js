import React, { useState } from 'react';
import API from '../../api';

const SendFriendRequest = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/send', { recipientUsername: username }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Friend request sent to ${username}`);
    } catch (error) {
      setMessage(error.response.data.message || 'Error sending friend request');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit">Send Friend Request</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SendFriendRequest;
