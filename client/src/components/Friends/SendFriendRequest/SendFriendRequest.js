import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import debounce from 'lodash.debounce';
import './SendFriendRequest.css';

const SendFriendRequest = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

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
        setUserFriends(data);
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
      setUsers(data);
      filterUsers(data);
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

  const filterUsers = (data) => {
    const friends = userFriends.map(friend => friend._id);
    const friendsList = data.filter(user => friends.includes(user._id));
    const nonFriendsList = data.filter(user => !friends.includes(user._id));
    setFilteredUsers([...friendsList, ...nonFriendsList]);
  };

  const handleUserClick = (userId) => {
    const isFriend = userFriends.some(friend => friend._id === userId);
    if (isFriend) {
      navigate(`/chat/${userId}`);
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
        className="search-input"
      />
      <ul className="user-list">
        {filteredUsers.map((user) => (
          <li key={user._id} className="user-item" onClick={() => handleUserClick(user._id)}>
            <img src={user.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'} alt="Profile" className="friend-profile-picture" />
            <div className="friend-details">
              <p className="friend-full-name">{user.fullName}</p>
              <p className="friend-username">@{user.username}</p>
              {renderUserAction(user)}
            </div>
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendFriendRequest;
