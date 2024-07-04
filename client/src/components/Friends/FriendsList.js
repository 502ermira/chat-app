import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

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
    <div>
      <h1>Friends List</h1>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} onClick={() => handleChatSelect(friend._id)}>
            {friend.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
