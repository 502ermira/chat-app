const express = require('express');
const { registerUser, authUser, verifyToken, verifyTokenEndpoint, getUserData, updateUserData } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/verify-token', verifyTokenEndpoint); 
router.get('/users/me', verifyToken, getUserData); 
router.put('/users/me', verifyToken, updateUserData); 

module.exports = router;
