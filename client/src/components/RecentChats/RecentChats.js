import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RecentChats.css';
import API from '../../api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUnseenMessages } from '../../contexts/UnseenMessagesContext';

const RecentChats = () => {
  const { user } = useAuth();
  const { fetchUnseenMessagesCount } = useUnseenMessages();
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const location = useLocation();

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchRecentChats();
    } else {
      console.log('User not found in context');
    }
  }, [user, location]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (newMessage) => {
        setRecentChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            if (chat.friend._id === newMessage.sender._id) {
              return {
                ...chat,
                lastMessage: newMessage,
                unopenedCount: chat.unopenedCount + (newMessage.seen ? 0 : 1),
              };
            }
            return chat;
          });

          const isExistingChat = updatedChats.some(chat => chat.friend._id === newMessage.sender._id);
          if (!isExistingChat) {
            updatedChats.push({
              friend: newMessage.sender,
              lastMessage: newMessage,
              unopenedCount: newMessage.seen ? 0 : 1,
            });
          }

          return updatedChats;
        });
        fetchUnseenMessagesCount();
      };

      const handleMessagesSeen = ({ friendId }) => {
        setRecentChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            if (chat.friend._id === friendId) {
              return {
                ...chat,
                unopenedCount: 0,
              };
            }
            return chat;
          });
          return updatedChats;
        });
        fetchUnseenMessagesCount();
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('messages_seen', handleMessagesSeen);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('messages_seen', handleMessagesSeen);
      };
    }
  }, [socket, fetchUnseenMessagesCount]);

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
                  <div className={`recent-chat-item ${chat.unopenedCount > 0 ? 'recent-chat-unseen' : ''}`}>
                    <div className="recent-chat-header">
                      <p className="recent-chat-username">{chat.friend && chat.friend.username ? chat.friend.username : 'Unknown user'}</p>
                      <p className="recent-chat-timestamp">{chat.lastMessage ? formatDate(chat.lastMessage.timestamp) : ''}</p>
                    </div>
                    <p className="recent-chat-message">
                      {chat.lastMessage && isMeSender(chat.lastMessage.sender._id) ? 'Me: ' : ''}
                      {chat.lastMessage ? chat.lastMessage.message : 'No messages yet'}
                    </p>
                    {chat.unopenedCount > 0 && <span className="unopened-count">{chat.unopenedCount}</span>}
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
