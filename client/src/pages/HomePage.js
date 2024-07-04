import React, { useState } from 'react';
import FriendsList from '../components/Friends/FriendsList';
import SendFriendRequest from '../components/Friends/SendFriendRequest';
import RespondFriendRequest from '../components/Friends/RespondFriendRequest';
import LogoutButton from '../components/Auth/LogoutButton';
import Chat from '../components/Chat/Chat'; 

const HomePage = () => {
  const [activeChat, setActiveChat] = useState(null);

  const handleChatSelect = (friendId) => {
    setActiveChat(friendId);
  };

  return (
    <div>
      <h1>Home</h1>
      <LogoutButton />
      <SendFriendRequest />
      <RespondFriendRequest />
      <FriendsList onChatSelect={handleChatSelect} />
      {activeChat && <Chat friendId={activeChat} />}
    </div>
  );
};

export default HomePage;
