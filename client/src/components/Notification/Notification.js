import React from 'react';
import './Notification.css';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate, useMatch } from 'react-router-dom';

const Notification = () => {
  const { notifications } = useNotification();
  const navigate = useNavigate();
  const chatMatch = useMatch('/chat/:friendId');
  const currentFriendId = chatMatch?.params.friendId;

  const handleClick = (notification) => {
    navigate(`/chat/${notification.senderId}`);
  };

  return (
    <div className="notification-container">
      {notifications.length > 0 && notifications[0].senderId !== currentFriendId && (
        <div className="notification" onClick={() => handleClick(notifications[0])}>
          <p><strong>{notifications[0].username}</strong>: {notifications[0].message}</p>
          <p className="notification-timestamp">{notifications[0].timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default Notification;
