import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import API from '../api';
import { useNotification } from './NotificationContext';

const UnseenMessagesContext = createContext();

export const useUnseenMessages = () => useContext(UnseenMessagesContext);

export const UnseenMessagesProvider = ({ children }) => {
  const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);
  const socket = useSocket();
  const { addNotification } = useNotification();

  const fetchUnseenMessagesCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await API.get('/chats/unseen-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnseenMessagesCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unseen messages count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnseenMessagesCount();

    if (socket) {
      const handleReceiveMessage = (newMessage) => {
        setUnseenMessagesCount((prevCount) => prevCount + 1);
        addNotification({
          username: newMessage.sender.username,
          message: newMessage.message,
          timestamp: new Date(newMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderId: newMessage.sender._id,
        });
      };

      const handleMessagesSeen = () => {
        fetchUnseenMessagesCount();
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('messages_seen', handleMessagesSeen);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('messages_seen', handleMessagesSeen);
      };
    }
  }, [socket, fetchUnseenMessagesCount, addNotification]);

  return (
    <UnseenMessagesContext.Provider value={{ unseenMessagesCount, fetchUnseenMessagesCount }}>
      {children}
    </UnseenMessagesContext.Provider>
  );
};
