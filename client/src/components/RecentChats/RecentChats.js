import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './RecentChats.css';
import API from '../../api';

const RecentChats = () => {
  const { user } = useAuth(); 
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentChats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await API.get('/chats/recent', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecentChats(response.data);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecentChats();
    } else {
      console.log('User not found in context');
    }
  }, [user]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString();
  };

  const isMeSender = (senderId) => {
    return user && senderId === user.id;
  };

  return (
    <div className="recent-chats-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {recentChats.length === 0 ? (
            <p>No recent chats available</p>
          ) : (
            <div className="recent-chat-list">
              {recentChats.map((chat, index) => (
                <Link key={index} to={`/chat/${chat.friend._id}`} className="recent-chat-link">
                  <div className="recent-chat-item">
                    <div className="recent-chat-header">
                      <p className="recent-chat-username">{chat.friend && chat.friend.username ? chat.friend.username : 'Unknown user'}</p>
                      <p className="recent-chat-timestamp">{chat.lastMessage ? formatDate(chat.lastMessage.timestamp) : ''}</p>
                    </div>
                    <p className="recent-chat-message">
                      {chat.lastMessage && isMeSender(chat.lastMessage.sender._id) ? 'Me: ' : ''}
                      {chat.lastMessage ? chat.lastMessage.message : 'No messages yet'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentChats;
