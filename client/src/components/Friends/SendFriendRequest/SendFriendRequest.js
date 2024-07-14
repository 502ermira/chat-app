import React, { useState, useEffect } from 'react';
import API from '../../../api';
import debounce from 'lodash.debounce';
import './SendFriendRequest.css';

const SendFriendRequest = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/friends/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    const fetchUserFriends = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Remove duplicates
        const uniqueFriends = Array.from(new Set(data.map(friend => friend._id)))
          .map(id => data.find(friend => friend._id === id));
        setUserFriends(uniqueFriends);
      } catch (error) {
        console.error('Error fetching user friends:', error);
      }
    };

    fetchPendingRequests();
    fetchUserFriends();
  }, []);

  const fetchUsers = debounce(async (searchUsername) => {
    if (searchUsername.trim() === '') {
      setUsers([]);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get(`/friends/search?username=${searchUsername}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out the logged-in user
      const filteredData = data.filter(user => user.username !== localStorage.getItem('username'));
      setUsers(filteredData);
    } catch (error) {
      setMessage(error.response.data.message || 'Error searching users');
    }
  }, 300);

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setUsername(searchTerm);
    fetchUsers(searchTerm);
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

  const handleRespond = async (requestId, status) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/respond', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Friend request ${status}`);
      setPendingRequests(pendingRequests.filter(request => request._id !== requestId));
    } catch (error) {
      setMessage(error.response.data.message || `Error ${status} friend request`);
    }
  };

  const renderUserAction = (user) => {
    const isFriend = userFriends.some(friend => friend._id === user._id);

    if (isFriend) {
      return <span>&nbsp;-Friends</span>;
    } else {
      const pendingRequest = pendingRequests.find(request => request.requester.username === user.username);

      if (pendingRequest) {
        return (
          <span>
            <button onClick={() => handleRespond(pendingRequest._id, 'accepted')}>Accept</button>
            <button onClick={() => handleRespond(pendingRequest._id, 'declined')}>Decline</button>
          </span>
        );
      } else {
        return <button onClick={() => handleAddFriend(user.username)}>Add</button>;
      }
    }
  };

  return (
    <div className="send-friend-request-container">
      <input
        type="text"
        placeholder="Search Username"
        value={username}
        onChange={handleSearchChange}
      />
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.username}
            {renderUserAction(user)}
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendFriendRequest;
