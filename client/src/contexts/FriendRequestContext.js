import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API from '../api';
import { useSocket } from './SocketContext';
import { useNotification } from './NotificationContext';

const FriendRequestContext = createContext();

export const useFriendRequest = () => useContext(FriendRequestContext);

export const FriendRequestProvider = ({ children }) => {
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const socket = useSocket();
  const { addNotification } = useNotification();

  const fetchFriendRequestCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await API.get('/friends/requests/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequestCount(data.count);
    } catch (error) {
      console.error('Error fetching friend request count:', error);
    }
  }, []);

  useEffect(() => {
    fetchFriendRequestCount();

    if (socket) {
      const handleFriendRequestReceived = (request) => {
        setFriendRequestCount((prevCount) => prevCount + 1);
        addNotification({
          username: request.requester.username,
          message: 'sent you a friend request',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderId: request.requester._id,
          type: 'friendRequest'
        });
      };

      const handleFriendRequestResponded = () => {
        setFriendRequestCount((prevCount) => prevCount - 1);
        fetchFriendRequestCount();
      };

      socket.on('friend-request-received', handleFriendRequestReceived);
      socket.on('friend-request-responded', handleFriendRequestResponded);

      return () => {
        socket.off('friend-request-received', handleFriendRequestReceived);
        socket.off('friend-request-responded', handleFriendRequestResponded);
      };
    }
  }, [socket, fetchFriendRequestCount, addNotification]);

  return (
    <FriendRequestContext.Provider value={{ friendRequestCount, fetchFriendRequestCount }}>
      {children}
    </FriendRequestContext.Provider>
  );
};
