import { useState, useEffect } from 'react';
import API from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import { useFriendRequest } from '../../../contexts/FriendRequestContext';
import './RespondFriendRequest.css';

const RespondFriendRequest = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { fetchFriendRequestCount } = useFriendRequest();
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [message, setMessage] = useState('');

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    if (diff < oneMinute) {
      return 'Just now';
    } else if (diff < oneHour) {
      const minutes = Math.floor(diff / oneMinute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < oneDay) {
      const hours = Math.floor(diff / oneHour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < 2 * oneDay) {
      return 'Yesterday';
    } else if (diff < 7 * oneDay) {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get('/friends/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedRequests = data.map(request => ({
        ...request,
        friend: user.id === request.requester._id ? request.recipient : request.requester
      }));
      setRequests(updatedRequests.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (socket) {
      socket.on('friend-request-received', fetchRequests);
      socket.on('friend-request-responded', fetchRequests);
      socket.on('friend-request-cancelled', fetchRequests);
    }

    return () => {
      if (socket) {
        socket.off('friend-request-received', fetchRequests);
        socket.off('friend-request-responded', fetchRequests);
        socket.on('friend-request-cancelled', fetchRequests);
      }
    };
  }, [socket, user.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(requests => [...requests]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (requestId, status) => {
    const token = localStorage.getItem('token');
    try {
      if (!token) {
        throw new Error('Token not found');
      }

      const { data } = await API.post('/friends/respond', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(requests.map(request =>
        request._id === requestId
          ? { ...request, status, respondedAt: new Date().toISOString() }
          : request
      ).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));

      fetchFriendRequestCount();

    } catch (error) {
      setMessage(error.response?.data?.message || `Error ${status} friend request`);
      console.error(`Error responding to request ${requestId} with status ${status}:`, error);
    }
  };

  const renderMessage = (request) => {
    const isRequester = user.id === request.requester._id;
    const otherUser = isRequester ? request.recipient : request.requester;

    if (request.status === 'accepted') {
      return isRequester
        ? `accepted your friend request`
        : `You accepted their friend request`;
    } else if (request.status === 'declined') {
      return isRequester
        ? `declined your friend request`
        : `You declined their friend request`;
    } else {
      return isRequester
        ? `You sent a friend request`
        : `sent you a friend request`;
    }
  };

  const receivedRequests = requests.filter(request => request.recipient._id === user.id);
  const pendingRequests = receivedRequests.filter(request => request.status === 'pending');

  const categorizeNotifications = (notifications) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categorized = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    notifications.forEach((notification) => {
      const date = new Date(notification.respondedAt || notification.sentAt);
      if (date >= today) {
        categorized.today.push(notification);
      } else if (date >= thisWeek) {
        categorized.thisWeek.push(notification);
      } else if (date >= thisMonth) {
        categorized.thisMonth.push(notification);
      } else {
        categorized.older.push(notification);
      }
    });

    return categorized;
  };

  const categorizedRequests = categorizeNotifications(requests);

  return (
    <div className="respond-friend-request">
      <h1>Friend Requests</h1>
      <div className="request-summary" onClick={() => setShowRequests(!showRequests)}>
        <h2>Requests</h2>
        <p>{pendingRequests.length} friend requests</p>
      </div>
      {showRequests && (
        <ul className="request-list">
          {pendingRequests.map((request) => (
            <li key={request._id} className="request-item">
              <img
                src={request.friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
                alt="Profile"
                className="requester-profile-picture"
              />
              <div className="requester-details">
                <p className="requester-full-name">{request.friend.fullName}</p>
                <p className="requester-username">@{request.friend.username}</p>
              </div>
              <div className="buttons-container">
                <button className="respond-button accept" onClick={() => handleRespond(request._id, 'accepted')}>Accept</button>
                <button className="respond-button decline" onClick={() => handleRespond(request._id, 'declined')}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Notifications</h2>
      {['today', 'thisWeek', 'thisMonth', 'older'].map(category => (
        categorizedRequests[category].length > 0 && (
          <div key={category} className="category">
            <h3>{category === 'today' ? 'Today' : category === 'thisWeek' ? 'This Week' : category === 'thisMonth' ? 'This Month' : 'Older'}</h3>
            <ul className="request-list">
              {categorizedRequests[category].map((request) => (
                <li key={request._id} className="request-item">
                  <img
                    src={request.friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
                    alt="Profile"
                    className="requester-profile-picture"
                  />
                  <div className="requester-details">
                    <p className="requester-full-name">{request.friend.fullName}</p>
                    <p className="requester-username">@{request.friend.username}</p>
                  </div>
                  <div className="notification-container">
                    <span className="request-notification">
                      {renderMessage(request)}
                    </span>
                    <span className="request-date">{formatDate(request.respondedAt || request.sentAt)}</span>
                  </div>
                  {request.status === 'pending' && request.recipient._id === user.id && (
                    <div className="buttons-container">
                      <button className="respond-button accept" onClick={() => handleRespond(request._id, 'accepted')}>Accept</button>
                      <button className="respond-button decline" onClick={() => handleRespond(request._id, 'declined')}>Decline</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
      {message && <div className="error-message">{message}</div>}
    </div>
  );
};

export default RespondFriendRequest;
