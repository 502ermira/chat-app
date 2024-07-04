const express = require('express');
const { registerUser, authUser, verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/verify-token', verifyToken);

module.exports = router;
