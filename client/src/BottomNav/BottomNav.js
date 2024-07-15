import { Link, useLocation } from 'react-router-dom';
import { useFriendRequest } from '../contexts/FriendRequestContext';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { friendRequestCount } = useFriendRequest();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/friends" className={location.pathname === '/friends' ? 'active' : ''}>Friends</Link>
      <Link to="/requests" className={location.pathname === '/requests' ? 'active' : ''}>
        Requests {friendRequestCount > 0 && <span className="notification-badge">{friendRequestCount}</span>}
      </Link>
      <Link to="/recent-chats" className={location.pathname === '/recent-chats' ? 'active' : ''}>Recent Chats</Link>
    </nav>
  );
};

export default BottomNav;
