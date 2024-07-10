const express = require('express');
const { getRecentChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recent', protect, getRecentChats);

module.exports = router;