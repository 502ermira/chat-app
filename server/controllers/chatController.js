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
          lastMessage: { $first: "$$ROOT" },
          unopenedCount: {
            $sum: {
              $cond: {
                if: { $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$seen", false] }] },
                then: 1,
                else: 0
              }
            }
          }
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
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo"
        }
      },
      {
        $unwind: "$senderInfo"
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.recipient",
          foreignField: "_id",
          as: "recipientInfo"
        }
      },
      {
        $unwind: "$recipientInfo"
      },
      {
        $project: {
          _id: 0,
          friend: { _id: 1, username: 1 },
          lastMessage: {
            sender: { _id: "$senderInfo._id", username: "$senderInfo.username" },
            recipient: { _id: "$recipientInfo._id", username: "$recipientInfo.username" },
            message: 1,
            timestamp: 1,
            seen: 1
          },
          unopenedCount: 1
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);

    res.json(recentChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

