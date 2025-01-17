import { BrowserRouter as Router, Routes, Route, Navigate, useMatch, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import RequestsPage from './pages/RequestsPage';
import RecentChatsPage from './pages/RecentChatsPage';
import BottomNav from './BottomNav/BottomNav';
import FriendInfo from './components/FriendInfo/FriendInfo.js';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FriendRequestProvider } from './contexts/FriendRequestContext';
import { UnseenMessagesProvider } from './contexts/UnseenMessagesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/Notification/Notification';
import ForgotPassword from './components/Auth/ForgotPassword/ForgotPassword.js';
import ResetPassword from './components/Auth/ResetPassword.js';
import LandingPage from './pages/LandingPage/LandingPage.js';
import './App.css';

const AppRoutes = () => {
  const { user } = useAuth();
  const isChatPage = useMatch('/chat/:friendId');
  const isLoginForm = useMatch('/login');
  const isSignupForm = useMatch('/signup');
  const isLandingPage =useMatch('/home');
  const isForgotPasswordPage =useMatch('/forgot-password');
  const isResetPasswordPage =useMatch('/reset-password/*');
  const location = useLocation();

  const hideNotifications = location.pathname === '/recent-chats';

  return (
    <>
      <Routes>
        <Route path="/home" element={!user ? <LandingPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/home" />} />
        <Route path="/chat/:friendId" element={user ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/friends" element={user ? <FriendsPage /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user ? <RequestsPage /> : <Navigate to="/login" />} />
        <Route path="/recent-chats" element={user ? <RecentChatsPage /> : <Navigate to="/login" />} />
        <Route path="/friend/:id" element={user ? <FriendInfo /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      {!isChatPage && !isLoginForm && !isSignupForm && !isLandingPage && !isForgotPasswordPage && !isResetPasswordPage && <BottomNav />}
      <Notification hideNotifications={hideNotifications} />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <UnseenMessagesProvider>
            <FriendRequestProvider>
              <Router>
                <AppRoutes />
              </Router>
            </FriendRequestProvider>
          </UnseenMessagesProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;