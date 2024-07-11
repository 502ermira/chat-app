const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId }
      ]
    }).sort({ createdAt: 1 }).populate('sender', 'username').populate('recipient', 'username');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markMessagesAsSeen = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  try {
    await Message.updateMany(
      { sender: friendId, recipient: userId, seen: false },
      { seen: true }
    );
    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};