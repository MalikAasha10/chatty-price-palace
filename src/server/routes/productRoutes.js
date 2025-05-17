
const express = require('express');
const { 
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getFeaturedProducts
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected seller routes
router.post('/', protect, sellerOnly, createProduct);
router.put('/:id', protect, sellerOnly, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);
router.get('/seller/my-products', protect, sellerOnly, getSellerProducts);

module.exports = router;
