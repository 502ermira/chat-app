const express = require('express');
const { getRecentChats, getUnseenMessagesCount, deleteMessagesWithFriend } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recent', protect, getRecentChats);
router.get('/unseen-count', protect, getUnseenMessagesCount);
router.delete('/messages/:friendId', protect, deleteMessagesWithFriend);

module.exports = router;