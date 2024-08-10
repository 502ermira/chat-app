require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { username, email, password, fullName, birthday, gender, profilePicture } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
      birthday,
      gender,
      profilePicture,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.verifyTokenEndpoint = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    res.json({ message: 'Token is valid' });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserData = async (req, res) => {
  try {
    const { username, email, password, fullName, birthday, gender, profilePicture } = req.body;
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password' });
      }
      user.password = password;
    }
    if (fullName) user.fullName = fullName;
    if (birthday) user.birthday = birthday;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpire = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `You have requested a password reset. Link expires in 10 minutes. Please use the following link to reset your password: ${resetUrl}`;

    await sendEmail(user.email, 'Password Reset Request', message);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error handling forgot password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};