import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to <span>Er-Net</span></h1>
        <p>Your personal space to connect, chat, and share.</p>
        <div className="cta-buttons">
          <Link to="/signup" className="cta-button button">Sign Up</Link>
          <Link to="/login" className="cta-button button">Login</Link>
        </div>
      </header>
      
      <section className="features-section">
        <div className="features">
          <div className="feature">
            <h3>Real-time Messaging</h3>
            <p>Chat with your friends in real-time with instant updates.</p>
          </div>
          <div className="feature">
            <h3>Notifications</h3>
            <p>Stay informed with notifications for new messages and friend requests.</p>
          </div>
          <div className="feature">
            <h3>Friend Requests</h3>
            <p>Connect with new people by sending and receiving friend requests.</p>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <p>&copy; 2024 Er-Net. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
