import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import './FriendInfo.css'; 
import { FaRegUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { PiCalendarDotsDuotone } from "react-icons/pi";
import { GiFemale, GiMale } from "react-icons/gi";
import ImageModal from '../ImageModal/ImageModal';
import { GoArrowLeft } from 'react-icons/go';

const FriendInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleClearChat = async () => {
    try {
      await API.delete(`/chats/messages/${id}`);
      setMessage('Chat cleared successfully');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error clearing chat');
    }
  };

  if (loading) return <div><p className='loader'></p></div>;
  if (error) return <div>Error: {error}</div>;

  if (!isFriend) return <div>You are not friends with this user.</div>;

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalImage(null);
    setShowModal(false);
  };

  return (
    <div className="user-profile">
      <button className="back-button" onClick={() => navigate(-1)}>
        <GoArrowLeft />
      </button>
      <div className="profile-view">
        <div className="profile-header">
          <img
            src={friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
            alt="Profile"
            className="profile-picture"
            onClick={() => openModal(friend.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1')}
          />
          <h2 className="profile-name">{friend.fullName}</h2>
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
          
          <div className="info-item">
            <button className="remove-friend-button" onClick={handleRemoveFriend}>
              Remove Friend
            </button>
          </div>
          <div className="info-item">
            <button className="clear-chat-button" onClick={handleClearChat}>
              Clear Chat
            </button>
          </div>
        </div>
        {message && <p className="success-message">{message}</p>}
        {showModal && <ImageModal imageUrl={modalImage} onClose={closeModal} />}
      </div>
    </div>
  );
};

export default FriendInfo;
