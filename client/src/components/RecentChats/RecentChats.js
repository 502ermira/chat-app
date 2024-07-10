import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './RecentChats.css'; 

const RecentChats = () => {
  const { user } = useAuth();
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/chats/recent', {
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

    fetchRecentChats();
  }, [user]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (dayDiff < 1) {
      return timeString;
    } else if (dayDiff < 7) {
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      return dayOfWeek;
    } else {
      return date.toLocaleDateString('en-GB');
    }
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
                    <p className="recent-chat-message">{chat.lastMessage ? chat.lastMessage.message : 'No messages yet'}</p>
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
