import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => (
  <div>
    <h1>Login</h1>
    <LoginForm />
    <p>
      Don't have an account? <Link to="/signup">Signup</Link>
    </p>
  </div>
);

export default LoginPage;
