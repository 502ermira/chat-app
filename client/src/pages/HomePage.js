import React from 'react';
import FriendsList from '../components/Friends/FriendsList';
import SendFriendRequest from '../components/Friends/SendFriendRequest';
import RespondFriendRequest from '../components/Friends/RespondFriendRequest';
import LogoutButton from '../components/Auth/LogoutButton';

const HomePage = () => (
  <div>
    <h1>Home</h1>
    <LogoutButton />
    <SendFriendRequest />
    <RespondFriendRequest />
    <FriendsList />
  </div>
);

export default HomePage;
