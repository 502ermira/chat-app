import React from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat/Chat';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const { friendId } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <Chat friendId={friendId} userId={user.id} />
    </div>
  );
};

export default ChatPage;
