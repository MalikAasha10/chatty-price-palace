
const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  getUserOrders,
  changePassword 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/:id')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/:id/orders')
  .get(getUserOrders);

router.route('/:id/password')
  .put(changePassword);

module.exports = router;
