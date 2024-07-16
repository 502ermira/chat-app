import React, { useEffect } from 'react';
import RecentChats from '../components/RecentChats/RecentChats';
import { useNotification } from '../contexts/NotificationContext';

const RecentChatsPage = () => {
  const { clearNotifications } = useNotification();

  useEffect(() => {
    clearNotifications();
  }, [clearNotifications]);

  return (
    <div>
      <h1>Recent Chats</h1>
      <RecentChats />
    </div>
  );
};

export default RecentChatsPage;
