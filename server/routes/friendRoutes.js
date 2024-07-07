const express = require('express');
const { sendFriendRequest, respondToFriendRequest, getFriends, getFriendRequests, searchUsers, getUserById } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendFriendRequest);
router.post('/respond', protect, respondToFriendRequest);
router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.get('/search', protect, searchUsers);
router.get('/user/:id', protect, getUserById);

module.exports = router;
