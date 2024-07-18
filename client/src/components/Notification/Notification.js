import React from 'react';
import './Notification.css';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate, useMatch } from 'react-router-dom';

const Notification = () => {
  const { notifications } = useNotification();
  const navigate = useNavigate();
  const isRequestsPage = useMatch('/requests');
  const isRecentChatsPage = useMatch('/recent-chats');

  const handleClick = (notification) => {
    if (notification.type === 'message') {
      navigate(`/chat/${notification.senderId}`);
    } else if (notification.type === 'friendRequest') {
      navigate('/requests');
    }
  };

  if (
    (isRequestsPage && notifications[0]?.type === 'friendRequest') || 
    (isRecentChatsPage && notifications[0]?.type === 'message')
  ) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.length > 0 && (
        <div className="notification" onClick={() => handleClick(notifications[0])}>
          <p><strong>{notifications[0].username}</strong>: {notifications[0].message}</p>
          <p className="notification-timestamp">{notifications[0].timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default Notification;
