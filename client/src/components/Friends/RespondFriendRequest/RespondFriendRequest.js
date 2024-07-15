import React, { useState, useEffect } from 'react';
import API from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';
import './RespondFriendRequest.css';

const RespondFriendRequest = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
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
    fetchRequests();
  }, [user._id]); 

  const handleRespond = async (requestId, status) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/respond', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.map(request =>
        request._id === requestId
          ? { ...request, status, respondedAt: new Date().toISOString() }
          : request
      ));
      console.log(`Responded to request ${requestId} with status ${status}`);
    } catch (error) {
      setMessage(error.response.data.message || `Error ${status} friend request`);
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

  return (
    <div className="respond-friend-request">
      <h1>Friend Requests</h1>
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
            {request.status === 'pending' ? (
              <div className="buttons-container">
                {user._id === request.recipient._id ? (
                  <>
                    <button className="respond-button accept" onClick={() => handleRespond(request._id, 'accepted')}>Accept</button>
                    <button className="respond-button decline" onClick={() => handleRespond(request._id, 'declined')}>Decline</button>
                  </>
                ) : (
                  <span className="request-status">Pending</span>
                )}
              </div>
            ) : (
              <span className="notification">{renderMessage(request)}</span>
            )}
          </li>
        ))}
      </ul>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RespondFriendRequest;
