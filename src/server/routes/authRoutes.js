const express = require('express');
const { 
  registerUser, 
  loginUser, 
  registerSeller, 
  loginSeller,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Seller routes
router.post('/seller/register', registerSeller);
router.post('/seller/login', loginSeller);

// Profile route
router.get('/me', protect, getMe);

module.exports = router;