const express = require('express');
const { sendFriendRequest, respondToFriendRequest, getFriends, getFriendRequests, searchUsers, getUserById, getFriendRequestCount, getFriendProfile, removeFriend } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendFriendRequest);
router.post('/respond', protect, respondToFriendRequest);
router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.get('/search', protect, searchUsers);
router.get('/user/:id', protect, getUserById);
router.get('/requests/count', protect, getFriendRequestCount);
router.get('/friend/:id', protect, getFriendProfile);
router.delete('/remove/:id', protect, removeFriend);

module.exports = router;
