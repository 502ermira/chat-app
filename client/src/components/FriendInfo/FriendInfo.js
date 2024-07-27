import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api';
import './FriendInfo.css'; 
import { FaRegUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { PiCalendarDotsDuotone } from "react-icons/pi";
import { GiFemale, GiMale } from "react-icons/gi";

const FriendInfo = () => {
  const { id } = useParams();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const { data } = await API.get(`friends/friend/${id}`);
        setFriend(data);
        setLoading(false);
      } catch (error) {
        setError(error.response && error.response.data.message 
                  ? error.response.data.message 
                  : error.message);
        setLoading(false);
      }
    };

    fetchFriend();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
      </div>
    </div>
  );
};

export default FriendInfo;