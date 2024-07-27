import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import './FriendInfo.css'; 
import { FaRegUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { PiCalendarDotsDuotone } from "react-icons/pi";
import { GiFemale, GiMale } from "react-icons/gi";

const FriendInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const { data } = await API.get(`friends/friend/${id}`);
        setFriend(data.user);
        setIsFriend(data.isFriend);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchFriend();
  }, [id]);

  const handleRemoveFriend = async () => {
    try {
      await API.delete(`/friends/remove/${id}`);
      setMessage('Friend removed successfully');
      setTimeout(() => {
        navigate('/friends');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error removing friend');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!isFriend) return <div>You are not friends with this user.</div>;

  return (
    <div className="user-profile">
      <div className="profile-view">
        <div className="profile-header">
          <img
            src={friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
            alt="Profile"
            className="profile-picture"
          />
          <h2 className="profile-name">{friend.fullName}</h2>
          <button className="remove-friend-button" onClick={handleRemoveFriend}>
            Remove Friend
          </button>
        </div>
        <div className="info">
          <p className="info-item"><span className="info-label"><FaRegUser /></span> {friend.username}</p>
          <p className="info-item"><span className="info-label"><PiCalendarDotsDuotone /></span> {new Date(friend.birthday).toLocaleDateString()}</p>
          <p className="info-item">
            <span className="info-label">
              {friend.gender === 'male' ? <GiMale /> : <GiFemale />}
            </span>
            {friend.gender}
          </p>
          <p className="info-item"><span className="info-label"><AiOutlineMail /></span> {friend.email}</p>
        </div>
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
};

export default FriendInfo;
