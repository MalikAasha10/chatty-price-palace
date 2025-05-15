
const express = require('express');
const {
  createBargainSession,
  getBuyerBargains,
  getSellerBargains,
  getBargainSession,
  addMessage,
  updateBargainStatus
} = require('../controllers/bargainController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - none

// Protected user routes
router.post('/', protect, createBargainSession);
router.get('/buyer', protect, getBuyerBargains);
router.get('/:id', protect, getBargainSession);
router.post('/:id/message', protect, addMessage);

// Protected seller routes
router.get('/seller', protect, sellerOnly, getSellerBargains);
router.put('/:id/status', protect, sellerOnly, updateBargainStatus);

module.exports = router;
