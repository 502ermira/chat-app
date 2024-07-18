import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import './FriendsList.css';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, []);

  const handleChatSelect = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <div className="friends-list">
      <h1>Friends List</h1>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} onClick={() => handleChatSelect(friend._id)} className="friend-item">
            <img src={friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'} alt="Profile" className="friend-profile-picture" />
            <div className="friend-details">
              <p className="friend-full-name">{friend.fullName}</p>
              <p className="friend-username">@{friend.username}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;