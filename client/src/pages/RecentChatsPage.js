import React, { useEffect } from 'react';
import RecentChats from '../components/RecentChats/RecentChats';
import { useNotification } from '../contexts/NotificationContext';

const RecentChatsPage = () => {
  const { clearNotifications } = useNotification();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      clearNotifications();
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [clearNotifications]);

  return (
    <div>
      <h1>Recent Chats</h1>
      <RecentChats />
    </div>
  );
};

export default RecentChatsPage;
