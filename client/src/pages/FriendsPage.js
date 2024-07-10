import React from 'react';
import FriendsList from '../components/Friends/FriendsList';
import SendFriendRequest from '../components/Friends/SendFriendRequest';

const FriendsPage = () => (
  <div>
    <h1>Friends</h1>
    <SendFriendRequest />
    <FriendsList />
  </div>
);

export default FriendsPage;