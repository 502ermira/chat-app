import { createContext, useState, useContext, useEffect } from 'react';
import API from '../api';
import { useSocket } from './SocketContext';

const FriendRequestContext = createContext();

export const useFriendRequest = () => useContext(FriendRequestContext);

export const FriendRequestProvider = ({ children }) => {
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const socket = useSocket();

  const fetchFriendRequestCount = async () => {
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
  };

  useEffect(() => {
    fetchFriendRequestCount();

    if (socket) {
      socket.on('friend-request-received', () => {
        setFriendRequestCount((prevCount) => prevCount + 1);
      });

      socket.on('friend-request-responded', () => {
        setFriendRequestCount((prevCount) => prevCount - 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('friend-request-received');
        socket.off('friend-request-responded');
      }
    };
  }, [socket]);

  return (
    <FriendRequestContext.Provider value={{ friendRequestCount, fetchFriendRequestCount }}>
      {children}
    </FriendRequestContext.Provider>
  );
};