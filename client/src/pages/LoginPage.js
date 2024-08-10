import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm/LoginForm';

const LoginPage = () => (
  <div className="login-page">
    <h1 className="login-title">e</h1>
    <LoginForm />
    <p className="signup-link">
      Don't have an account? <Link to="/signup">Signup</Link>
    </p>
  </div>
);

export default LoginPage;
