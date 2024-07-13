import LogoutButton from '../components/Auth/LogoutButton';
import UserProfile from '../components/UserProfile/UserProfile';

const HomePage = () => {

  return (
    <div>
      <h1>Home</h1>
      <LogoutButton />
      <UserProfile />
    </div>
  );
};

export default HomePage;
