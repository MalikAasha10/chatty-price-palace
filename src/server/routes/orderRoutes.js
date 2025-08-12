const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected user routes
router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

// Protected seller routes
router.put('/:id/status', protect, sellerOnly, updateOrderStatus);

module.exports = router;