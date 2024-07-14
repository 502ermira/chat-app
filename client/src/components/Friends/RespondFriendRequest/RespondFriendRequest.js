import React, { useState, useEffect } from 'react';
import API from '../../../api';
import './RespondFriendRequest.css';

const RespondFriendRequest = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/friends/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleRespond = async (requestId, status) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.post('/friends/respond', { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Friend request ${status}`);
      setRequests(requests.filter(request => request._id !== requestId));
    } catch (error) {
      setMessage(error.response.data.message || `Error ${status} friend request`);
    }
  };

  return (
    <div className="respond-friend-request">
      <h1>Friend Requests</h1>
      <ul className="request-list">
        {requests.map((request) => (
          <li key={request._id} className="request-item">
            <span className="requester-username">{request.requester.username}</span>
            <div className="buttons-container">
              <button className="respond-button accept" onClick={() => handleRespond(request._id, 'accepted')}>Accept</button>
              <button className="respond-button decline" onClick={() => handleRespond(request._id, 'declined')}>Decline</button>
            </div>
          </li>
        ))}
      </ul>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RespondFriendRequest;
