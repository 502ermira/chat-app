const express = require('express');
const { getMessages, markMessagesAsSeen } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:friendId', protect, getMessages);
router.post('/:friendId/seen', protect, markMessagesAsSeen);

module.exports = router;
