import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import './SignupForm.css';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (fullName.length < 3 || fullName.length > 50) {
      setMessage('Full Name must be between 3 and 50 characters');
      return;
    }
  
    if (username.length < 3 || username.length > 23) {
      setMessage('Username must be between 3 and 23 characters');
      return;
    }
  
    if (password.length < 8 || password.length > 50) {
      setMessage('Password must be between 8 and 50 characters');
      return;
    }
  
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
  
    setLoading(true);
  
    try {
      const { data } = await API.post('/auth/register', {
        username,
        email,
        password,
        fullName,
        birthday,
        gender,
        profilePicture,
      });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      setMessage(error.response.data.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="signup-input"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="signup-input"
          required
        />
      </div>
      <div className="form-row">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="signup-input"
          required
        />
        <div className="custom-date-input">
          <input
            type="text"
            placeholder="Birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="signup-input"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = birthday ? 'date' : 'text')}
          />
        </div>
      </div>
      <div className="form-row">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signup-input"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="signup-input"
          required
        />
      </div>
      <div className="form-row">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="signup-input-select"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="file"
          onChange={handleFileChange}
          className="signup-input"
        />
      </div>
      <button type="submit" disabled={loading} className="signup-button">
        {loading ? 'Loading...' : 'Signup'}
      </button>
      {message && <p className="error-message">{message}</p>}
    </form>
  );
};

export default SignupForm;
