const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, uploadSingle, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
