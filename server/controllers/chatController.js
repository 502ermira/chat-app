const Message = require('../models/Message');
const User = require('../models/User');

exports.getRecentChats = async (req, res) => {
  const userId = req.user._id;

  try {
    const recentChats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "friend"
        }
      },
      {
        $unwind: "$friend"
      },
      {
        $project: {
          _id: 0,
          friend: { _id: 1, username: 1 },
          lastMessage: {
            sender: { _id: 1, username: 1 },
            recipient: { _id: 1, username: 1 },
            message: 1,
            timestamp: 1
          }
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);

    res.json(recentChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
