import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';
import './UserProfile.css';
import LogoutButton from '../Auth/LogoutButton';
import { FaRegUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { PiCalendarDotsDuotone } from "react-icons/pi";
import { IoEyeOutline } from "react-icons/io5";
import { GrUpdate } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import { GiFemale, GiMale } from "react-icons/gi";
import ImageModal from '../ImageModal/ImageModal';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthday: '',
    gender: '',
    profilePicture: '',
  });
  const [initialData, setInitialData] = useState({});
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get('/auth/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          birthday: data.birthday ? data.birthday.substring(0, 10) : '',
          gender: data.gender,
          profilePicture: data.profilePicture,
          password: '',
          confirmPassword: '',
        };
        setUserData(userData);
        setInitialData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData((prevData) => ({
        ...prevData,
        profilePicture: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setEditing(true);
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await API.put(
        '/auth/users/me',
        {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          birthday: userData.birthday,
          gender: userData.gender,
          profilePicture: userData.profilePicture,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditing(false);
      setMessage(data.message || 'User Data updated successfully');
      setError('');
      setInitialData({ ...userData, password: '', confirmPassword: '' }); 
    } catch (error) {
      console.error('Error updating user data:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error updating user data');
      }
      setMessage('');
    }
  };  
  
  const handleCancel = () => {
    setUserData(initialData);
    setEditing(false);
    setMessage('');
    setError('');
  };

  const hasChanges = () => {
    const fieldsToCompare = ['username', 'email', 'fullName', 'birthday', 'gender', 'profilePicture'];
    for (const field of fieldsToCompare) {
      if (userData[field] !== initialData[field]) {
        return true;
      }
    }
    return userData.password !== '' || userData.confirmPassword !== '';
  };
  
  const handlePasswordUpdate = () => {
    setEditing(true);
    setMessage('');
    setError('');
    setTimeout(() => {
      passwordRef.current.focus();
    }, 0);
  };
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
      {message && <div className="user-profile-message">{message}</div>}
      {error && <div className="error">{error}</div>}
      {editing ? (
        <div className="edit-form">
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="input-field"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="input-field"
            />
          </label>
          <label>
            Full Name:
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              className="input-field"
            />
          </label>
          <label>
            Birthday:
            <input
              type="date"
              name="birthday"
              value={userData.birthday}
              onChange={handleChange}
              className="input-field"
            />
          </label>
          <label>
            Gender:
            <select
              name="gender"
              value={userData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Profile Picture:
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              className="input-field"
            />
          </label>
          <label>
            New Password:
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              ref={passwordRef}
              className="input-field"
            />
          </label>
          <label>
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="input-field"
            />
          </label>
          <div className="button-group">
           <button onClick={handleSave} className="save-button" disabled={!hasChanges()}>Save</button>
           <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="profile-view">
          <div className="profile-header">
            <img
              src={userData.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
              alt="Profile"
              className="profile-picture"
              onClick={() => openModal(userData.profilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1')}
            />
            <h2 className="profile-name">{userData.fullName}</h2>
          </div>
          <div className="info">
            <p className="info-item"><span className="info-label"><FaRegUser /></span> {userData.username}</p>
            <p className="info-item"><span className="info-label"><PiCalendarDotsDuotone /></span> {userData.birthday}</p>
            <p className="info-item">
              <span className="info-label">
                {userData.gender === 'male' ? <GiMale /> : <GiFemale />}
              </span>
              {userData.gender}
            </p>
            <p className="info-item"><span className="info-label"><AiOutlineMail /></span> {userData.email}</p>
            <p className="info-item">
              <span className="info-label"><IoEyeOutline /></span>
              Password 
              <button onClick={handlePasswordUpdate} className="update-button"><GrUpdate /></button>
            </p>
            <p className="info-item">
              <span className="info-label"><FiLogOut /></span>
              <LogoutButton className="logout-button" />
            </p>
          </div>
          <button onClick={handleEdit} className="edit-button">Edit Profile</button>
          {showModal && <ImageModal imageUrl={modalImage} onClose={closeModal} />}
        </div>
        
      )}
    </div>
  );
};

export default UserProfile;
