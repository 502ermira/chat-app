import { Link, useLocation } from 'react-router-dom';
import { useFriendRequest } from '../contexts/FriendRequestContext';
import { useUnseenMessages } from '../contexts/UnseenMessagesContext';
import { BsChatTextFill } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { friendRequestCount } = useFriendRequest();
  const { unseenMessagesCount } = useUnseenMessages();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}><FaHome /></Link>
      <Link to="/friends" className={location.pathname === '/friends' ? 'active' : ''}><FaUserFriends /> </Link>
      <Link to="/requests" className={location.pathname === '/requests' ? 'active' : ''}>
        <IoMdPersonAdd /> {friendRequestCount > 0 && <span className="notification-badge">{friendRequestCount}</span>}
      </Link>
      <Link to="/recent-chats" className={location.pathname === '/recent-chats' ? 'active' : ''}>
      <BsChatTextFill/> {unseenMessagesCount > 0 && <span className="notification-badge">{unseenMessagesCount}</span>}
      </Link>
    </nav>
  );
};

export default BottomNav;
