const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
