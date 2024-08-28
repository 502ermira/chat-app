import React from 'react';
import FriendsList from '../components/Friends/FriendList/FriendsList';
import SendFriendRequest from '../components/Friends/SendFriendRequest/SendFriendRequest';

const FriendsPage = () => (
  <div className='friends-page'>
    <h1>Friends</h1>
    <SendFriendRequest />
    <FriendsList />
  </div>
);

export default FriendsPage;