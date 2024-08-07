import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RecentChats.css';
import API from '../../api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUnseenMessages } from '../../contexts/UnseenMessagesContext';
import { AiOutlinePaperClip } from 'react-icons/ai';

const RecentChats = () => {
  const { user } = useAuth();
  const { fetchUnseenMessagesCount } = useUnseenMessages();
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState({});
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
        const sortedChats = response.data.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
        setRecentChats(sortedChats);
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

          const sortedChats = updatedChats.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
          return sortedChats;
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

      const handleTyping = ({ friendId }) => {
        setTypingIndicators((prevIndicators) => ({
          ...prevIndicators,
          [friendId]: true,
        }));
      };

      const handleStopTyping = ({ friendId }) => {
        setTypingIndicators((prevIndicators) => ({
          ...prevIndicators,
          [friendId]: false,
        }));
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('messages_seen', handleMessagesSeen);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('messages_seen', handleMessagesSeen);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
      };
    }
  }, [socket, fetchUnseenMessagesCount]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const dayDifference = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (dayDifference < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (dayDifference === 1) {
      return 'Yesterday';
    } else if (dayDifference < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  };

  const isMeSender = (senderId) => {
    return user && senderId === user.id;
  };

  const truncateMessage = (message, maxLength) => {
    if (typeof message === 'string' && message.length > maxLength) {
      return message.slice(0, maxLength) + '...';
    }
    return message;
  };

  const renderMessageContent = (message) => {
    if (!message) {
      return 'No message';
    } else if (typeof message.message === 'string') {
      return truncateMessage(message.message, 35);
    }
    return (
      <>
        <AiOutlinePaperClip /> Attachment
      </>
    );
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
                      {typingIndicators[chat.friend._id] ? (
                        <em>Typing...</em>
                      ) : (
                        <>
                          {chat.lastMessage && isMeSender(chat.lastMessage.sender._id) ? 'Me: ' : ''}
                          {chat.lastMessage ? renderMessageContent(chat.lastMessage) : 'No messages yet'}
                        </>
                      )}
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
