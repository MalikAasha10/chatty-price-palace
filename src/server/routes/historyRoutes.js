const express = require('express');
const { getBrowseHistory, addBrowseHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/user/:userId', protect, getBrowseHistory);
router.post('/', protect, addBrowseHistory);

module.exports = router;