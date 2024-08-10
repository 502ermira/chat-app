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
    <div className='recent-chats-page-container'>
      <RecentChats />
    </div>
  );
};

export default RecentChatsPage;
