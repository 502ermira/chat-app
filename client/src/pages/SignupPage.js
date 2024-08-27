import SignupForm from '../components/Auth/SingupForm/SignupForm';
import { Link } from 'react-router-dom';

const SignupPage = () => (
  <div className="signup-page">
    <h1 className="signup-title">e</h1>
    <SignupForm />
    <p className="login-link">
      Already have an account? <Link to="/login">Login</Link>
    </p>
  </div>
);

export default SignupPage;
