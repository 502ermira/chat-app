import React from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat/Chat';

const ChatPage = () => {
  const { friendId } = useParams();

  return (
    <div>
      <Chat friendId={friendId} />
    </div>
  );
};

export default ChatPage;
