import React, { useState } from 'react';
import API from '../../api';

const SendFriendRequest = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get(`/friends/search?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (error) {
      setMessage(error.response.data.message || 'Error searching users');
    }
  };

  const handleAddFriend = async (recipientUsername) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/send', { recipientUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Friend request sent to ${recipientUsername}`);
    } catch (error) {
      setMessage(error.response.data.message || 'Error sending friend request');
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.username}
            <button onClick={() => handleAddFriend(user.username)}>Add</button>
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendFriendRequest;
