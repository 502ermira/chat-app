const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

exports.sendFriendRequest = async (req, res) => {
  const { recipientUsername } = req.body;
  const requesterId = req.user._id;

  try {
    const recipient = await User.findOne({ username: recipientUsername });

    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (recipient._id.equals(requesterId)) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    const existingFriend = await User.findOne({ _id: requesterId, friends: recipient._id });
    if (existingFriend) {
      return res.status(400).json({ message: 'This user is already your friend' });
    }

    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      recipient: recipient._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const incomingRequest = await FriendRequest.findOne({
      requester: recipient._id,
      recipient: requesterId,
      status: 'pending'
    });

    if (incomingRequest) {
      return res.status(400).json({ message: 'You already have a friend request from this user' });
    }

    const newRequest = new FriendRequest({
      requester: requesterId,
      recipient: recipient._id,
      status: 'pending'
    });

    await newRequest.save();

    req.io.to(recipient._id.toString()).emit('friend-request-received', {
      requester: {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName,
        profilePicture: req.user.profilePicture,
      },
    });

    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  const { requestId, status } = req.body;
  const recipientId = req.user._id;

  try {
    const friendRequest = await FriendRequest.findById(requestId)
      .populate('requester', 'username fullName')
      .populate('recipient', 'username fullName');

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (!friendRequest.recipient._id.equals(recipientId)) {
      return res.status(403).json({ message: 'You are not authorized to respond to this request' });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    friendRequest.status = status;
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    if (status === 'accepted') {
      const requesterId = friendRequest.requester._id;
      await User.findByIdAndUpdate(requesterId, { $push: { friends: recipientId } });
      await User.findByIdAndUpdate(recipientId, { $push: { friends: requesterId } });
    }

    req.io.to(friendRequest.requester._id.toString()).emit('friend-request-responded');
    res.status(200).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  const { username } = req.query;
  const loggedInUserId = req.user._id;

  try {
    if (!username.trim()) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: `^${username}`, $options: 'i' }
    }).select('username fullName profilePicture');

    const loggedInUser = await User.findById(loggedInUserId).populate('friends');
    const friends = loggedInUser.friends.map(friend => friend._id.toString());
    const friendsList = users.filter(user => friends.includes(user._id.toString()));
    const nonFriendsList = users.filter(user => !friends.includes(user._id.toString()) && user._id.toString() !== loggedInUserId.toString());

    res.json([...friendsList, ...nonFriendsList]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('friends', 'username fullName profilePicture');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate('requester', 'username fullName profilePicture')
      .populate('recipient', 'username fullName profilePicture');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('username fullName profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status (500).json({ message: error.message });
  }
};

exports.getFriendRequestCount = async (req, res) => {
  try {
    const count = await FriendRequest.countDocuments({
      recipient: req.user._id,
      status: 'pending',
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriendProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.id;

    const user = await User.findById(friendId).select('-password -friendRequests');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFriend = await User.findOne({ _id: userId, friends: friendId });

    res.json({ user, isFriend: !!isFriend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id; 
    const friendId = req.params.id; 
 
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user._id;

  try {
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (!friendRequest.requester.equals(userId) && !friendRequest.recipient.equals(userId)) {
      return res.status(403).json({ message: 'You are not authorized to cancel this request' });
    }

    const recipientId = friendRequest.recipient.equals(userId) ? friendRequest.requester : friendRequest.recipient;

    await friendRequest.deleteOne();

    req.io.to(userId.toString()).emit('friend-request-cancelled', { requestId });
    req.io.to(recipientId.toString()).emit('friend-request-cancelled', { requestId });

    res.status(200).json({ message: 'Friend request canceled' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

