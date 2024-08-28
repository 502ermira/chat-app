import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import debounce from 'lodash.debounce';
import './SendFriendRequest.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SendFriendRequest = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  const latestUsernameRef = useRef(username);

  const fetchPendingRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get('/friends/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }, []);

  const fetchUserFriends = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get('/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserFriends(data);
    } catch (error) {
      console.error('Error fetching user friends:', error);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
    fetchUserFriends();
  }, [fetchPendingRequests, fetchUserFriends]);

  const fetchUsers = useCallback(
    debounce(async (searchUsername) => {
      if (latestUsernameRef.current !== searchUsername) return;

      if (searchUsername.trim() === '') {
        setUsers([]);
        return;
      }

      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get(`/friends/search?username=${searchUsername}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (latestUsernameRef.current === searchUsername) {
          setUsers(data);
          filterUsers(data);
        }
      } catch (error) {
        setMessage(error.response.data.message || 'Error searching users');
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setUsername(searchTerm);
    latestUsernameRef.current = searchTerm;

    if (searchTerm.trim() === '') {
      setUsers([]);
      setFilteredUsers([]);
    } else {
      fetchUsers(searchTerm);
    }
  };

  const handleAddFriend = async (recipientUsername) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/send', { recipientUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Friend request sent to @${recipientUsername}`);
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response.data.message || 'Error sending friend request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/cancel', { requestId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info('Friend request canceled');
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response.data.message || 'Error canceling friend request');
    }
  };

  const handleRespond = async (requestId, status) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/respond', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Friend request ${status}`);
      fetchPendingRequests();
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
      return <span className='friends-symbol'>&nbsp;~ Friends</span>;
    } else {
      const pendingRequest = pendingRequests.find(request => request.recipient.username === user.username && request.status === 'pending');

      if (pendingRequest) {
        return (
          <button onClick={() => handleCancelRequest(pendingRequest._id)} className='button'>Requested</button>
        );
      } else {
        return <button onClick={() => handleAddFriend(user.username)} className='button'>Add</button>;
      }
    }
  };

  return (
    <div className="send-friend-request-container">
      <input
        type="text"
        placeholder="Search Username..."
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
      <ToastContainer
       position="top-center"
       autoClose={3400}
       newestOnTop={false}
       closeOnClick
       rtl={false}
       theme="colored"
       hideProgressBar={true}
       style={{ width: '420px', borderRadius: '10px', fontSize: '16px' }}
       toastStyle={{ backgroundColor: '#173530', color: '#eee', boxShadow : '0 8px 20px rgba(0, 0, 0, 0.5)' }}
      />
    </div>
  );
};

export default SendFriendRequest;
