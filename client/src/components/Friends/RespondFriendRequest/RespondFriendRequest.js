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

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.get('/friends/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedRequests = data.map(request => ({
        ...request,
        friend: user._id === request.requester._id ? request.recipient : request.requester
      }));
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (socket) {
      socket.on('friend-request-received', fetchRequests);
      socket.on('friend-request-responded', fetchRequests);
    }

    return () => {
      if (socket) {
        socket.off('friend-request-received', fetchRequests);
        socket.off('friend-request-responded', fetchRequests);
      }
    };
  }, [socket, user._id]);

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
      ));
      
      console.log(`Responded to request ${requestId} with status ${status}`);
      
      // Fetch the latest friend request count
      fetchFriendRequestCount();
      
    } catch (error) {
      setMessage(error.response?.data?.message || `Error ${status} friend request`);
      console.error(`Error responding to request ${requestId} with status ${status}:`, error);
    }
  };
  
  const renderMessage = (request) => {
    const isRequester = user._id === request.requester._id;
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
        ? `You sent a friend request to @${otherUser.username}`
        : `@${otherUser.username} sent you a friend request`;
    }
  };

  const receivedRequests = requests.filter(request => request.recipient._id === user._id);
  const pendingRequests = receivedRequests.filter(request => request.status === 'pending');

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
      <ul className="request-list">
        {requests.map((request) => (
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
            <span className="notification">
              {renderMessage(request)}
              {request.status === 'pending' && request.recipient._id === user._id && (
                <div className="buttons-container">
                  <button className="respond-button accept" onClick={() => handleRespond(request._id, 'accepted')}>Accept</button>
                  <button className="respond-button decline" onClick={() => handleRespond(request._id, 'declined')}>Decline</button>
                </div>
              )}
            </span>
          </li>
        ))}
      </ul>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RespondFriendRequest;