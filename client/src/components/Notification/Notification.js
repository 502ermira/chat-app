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
    <div className="notification-page-container">
    {notifications.length > 0 && (
      <div className="notification-item" onClick={() => handleClick(notifications[0])}>
        <img
          src={notifications[0].profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
          alt="Profile"
          className="notification-profile-picture"
        />
        <div className="notification-content">
          <div className="notification-header">
            <p className="notification-full-name">{notifications[0].fullName}</p>
            <p className="notification-username">@{notifications[0].username}</p>
          </div>
          <p className="notification-message">{notifications[0].message}</p>
        </div>
        <p className="notification-timestamp">{notifications[0].timestamp}</p>
      </div>
    )}
  </div>

  );
};

export default Notification;
