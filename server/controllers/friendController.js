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

    const declinedRequest = await FriendRequest.findOne({
      requester: requesterId,
      recipient: recipient._id,
      status: 'declined'
    });

    if (declinedRequest) {
      declinedRequest.status = 'pending';
      await declinedRequest.save();
      return res.status(201).json(declinedRequest);
    }

    const friendRequest = await FriendRequest.create({
      requester: requesterId,
      recipient: recipient._id,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  const { requestId, status } = req.body;
  const recipientId = req.user._id;

  try {
    const friendRequest = await FriendRequest.findOne({ _id: requestId, recipient: recipientId });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    friendRequest.status = status;
    await friendRequest.save();

    if (status === 'accepted') {
      const requesterId = friendRequest.requester;

      await User.findByIdAndUpdate(requesterId, { $push: { friends: recipientId } });
      await User.findByIdAndUpdate(recipientId, { $push: { friends: requesterId } });

      await FriendRequest.deleteMany({
        requester: recipientId,
        recipient: requesterId
      });
    }

    res.status(200).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  const { username } = req.query;

  try {
    const users = await User.find({
      username: { $regex: username, $options: 'i' }
    }).select('username');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
      .populate('requester', 'username');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
