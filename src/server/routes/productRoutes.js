
const express = require('express');
const { 
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getFeaturedProducts,
  searchProducts
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);

// Protected seller routes
router.get('/seller/my-products', protect, sellerOnly, getSellerProducts);
router.post('/', protect, sellerOnly, createProduct);
router.put('/:id', protect, sellerOnly, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);

// Public route for single product (must be last to avoid route conflicts)
router.get('/:id', getProduct);

module.exports = router;
