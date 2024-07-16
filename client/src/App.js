import { BrowserRouter as Router, Routes, Route, Navigate, useMatch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import RequestsPage from './pages/RequestsPage';
import RecentChatsPage from './pages/RecentChatsPage';
import BottomNav from './BottomNav/BottomNav';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FriendRequestProvider } from './contexts/FriendRequestContext';
import './App.css';

const AppRoutes = () => {
  const { user } = useAuth();
  const isChatPage = useMatch('/chat/:friendId');

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/chat/:friendId" element={user ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/friends" element={user ? <FriendsPage /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user ? <RequestsPage /> : <Navigate to="/login" />} />
        <Route path="/recent-chats" element={user ? <RecentChatsPage /> : <Navigate to="/login" />} />
      </Routes>
      {!isChatPage && <BottomNav />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <FriendRequestProvider>
          <Router>
            <AppRoutes />
          </Router>
        </FriendRequestProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
