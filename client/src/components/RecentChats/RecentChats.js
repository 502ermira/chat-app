import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RecentChats.css';
import API from '../../api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUnseenMessages } from '../../contexts/UnseenMessagesContext';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { IoCheckmarkDone, IoCheckmarkOutline } from "react-icons/io5";

const RecentChats = () => {
  const { user } = useAuth();
  const { fetchUnseenMessagesCount } = useUnseenMessages();
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipedChat, setSwipedChat] = useState(null);
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
        const sortedChats = response.data.sort(
          (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
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

          const isExistingChat = updatedChats.some(
            (chat) => chat.friend._id === newMessage.sender._id
          );
          if (!isExistingChat) {
            updatedChats.push({
              friend: newMessage.sender,
              lastMessage: newMessage,
              unopenedCount: newMessage.seen ? 0 : 1,
            });
          }

          const sortedChats = updatedChats.sort(
            (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
          );
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
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else if (dayDifference === 1) {
      return 'Yesterday';
    } else if (dayDifference < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;
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
      return (
        <>
          {isMeSender(message.sender._id) && (
            <span className="recent-chat-seen-status">
              {message.seen ? (
                <IoCheckmarkDone /> 
              ) : (
                <IoCheckmarkOutline />
              )}
            </span>
          )}
          {truncateMessage(message.message, 30)}
        </>
      );
    }
    return (
      <>
        <AiOutlinePaperClip /> Attachment
        {isMeSender(message.sender._id) && (
          <span className="recent-chat-seen-status">
            {message.seen ? (
              <IoCheckmarkDone />
            ) : (
              <IoCheckmarkOutline />
            )}
          </span>
        )}
      </>
    );
  };

  const handleDeleteMessages = async (friendId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await API.delete(`chats/messages/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRecentChats(recentChats.filter((chat) => chat.friend._id !== friendId));
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const handleTouchStart = (e, chatId) => {
    const target = e.target;

    if (target.closest('.delete-button')) {
      return;
    }

    setSwipedChat(null);
    e.target.setAttribute('data-start-x', e.touches[0].clientX);
  };

  const handleTouchMove = (e, chatId) => {
    const target = e.target;

    if (target.closest('.delete-button')) {
      return;
    }

    const startX = parseFloat(target.getAttribute('data-start-x'));
    const moveX = e.touches[0].clientX;
    const deltaX = startX - moveX;

    if (deltaX > 50) {
      setSwipedChat(chatId);
    } else if (deltaX < -50) {
      setSwipedChat(null);
    }
  };

  return (
    <div className="recent-chats-container">
      <h2>Chats</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {recentChats.length === 0 ? (
            <p>No recent chats available</p>
          ) : (
            <div className="recent-chat-list">
              {recentChats.map((chat, index) => (
                <div
                  key={index}
                  className="recent-chat-wrapper"
                  onTouchStart={(e) => handleTouchStart(e, chat.friend._id)}
                  onTouchMove={(e) => handleTouchMove(e, chat.friend._id)}
                >
                  <Link
                    to={`/chat/${chat.friend._id}`}
                    className={`recent-chat-item ${
                      swipedChat === chat.friend._id ? 'swiped' : ''} ${
                      chat.unopenedCount > 0 ? 'recent-chat-unseen' : ''
                    }`}
                  >
                    <div className="recent-chat-item-container">
                      <div className="recent-chat-avatar">
                        <img
                          src={
                            chat.friend.profilePicture ||
                            'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'
                          }
                          alt="Profile"
                        />
                      </div>
                      <div className="recent-chat-item-content">
                        <div className="recent-chat-header">
                          <p className="recent-chat-fullname">
                            {chat.friend && chat.friend.fullName
                              ? chat.friend.fullName
                              : 'Unknown user'}
                          </p>
                          <p className="recent-chat-timestamp">
                            {chat.lastMessage
                              ? formatDate(chat.lastMessage.timestamp)
                              : ''}
                          </p>
                        </div>
                        <p className="recent-chat-message">
                          {typingIndicators[chat.friend._id] ? (
                            <em>Typing...</em>
                          ) : (
                            <>
                              {renderMessageContent(chat.lastMessage)}
                            </>
                          )}
                        </p>
                        {chat.unopenedCount > 0 && (
                          <span className="unopened-count">
                            {chat.unopenedCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  {swipedChat === chat.friend._id && (
                    <div className="delete-box">
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteMessages(chat.friend._id);
                        }}
                      >
                        <MdOutlineDeleteForever />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentChats;
