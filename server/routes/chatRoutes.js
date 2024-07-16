const express = require('express');
const { getRecentChats, getUnseenMessagesCount } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recent', protect, getRecentChats);
router.get('/unseen-count', protect, getUnseenMessagesCount);

module.exports = router;