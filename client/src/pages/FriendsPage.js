import React from 'react';
import FriendsList from '../components/Friends/FriendList/FriendsList';
import SendFriendRequest from '../components/Friends/FriendRequest/SendFriendRequest';

const FriendsPage = () => (
  <div>
    <h1>Friends</h1>
    <SendFriendRequest />
    <FriendsList />
  </div>
);

export default FriendsPage;