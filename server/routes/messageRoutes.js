const express = require('express');
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:friendId', protect, getMessages);

module.exports = router;
