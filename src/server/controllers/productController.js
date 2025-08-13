const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
exports.createProduct = async (req, res) => {
  try {
    // Add seller reference to product
    req.body.sellerRef = req.user._id;
    
    // Calculate discounted price if discount is provided
    if (req.body.discountPercentage > 0) {
      req.body.discountedPrice = req.body.price * (1 - req.body.discountPercentage / 100);
      req.body.isOnDeal = true;
    }
    
    // Create product
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const query = {};
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by deals if requested
    if (req.query.deals === 'true') {
      query.isOnDeal = true;
      query.discountPercentage = { $gt: 0 };
    }
    
    // Filter by bargaining if requested
    if (req.query.bargainable === 'true') {
      query.allowBargaining = true;
    }
    
    const products = await Product.find(query).populate('sellerRef', 'name storeName');
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    // Featured products could be the newest, most discounted, or most popular
    const featuredProducts = await Product.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(8)
      .populate('sellerRef', 'name storeName');
    
    const dealsProducts = await Product.find({ isOnDeal: true, discountPercentage: { $gt: 10 } })
      .sort({ discountPercentage: -1 }) // Sort by highest discount
      .limit(8)
      .populate('sellerRef', 'name storeName');
    
    const bargainableProducts = await Product.find({ allowBargaining: true })
      .limit(8)
      .populate('sellerRef', 'name storeName');
    
    res.status(200).json({
      success: true,
      featuredProducts,
      dealsProducts,
      bargainableProducts
    });
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerRef', 'name storeName');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if seller owns the product
    if (product.sellerRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Update discounted price if price or discount is changing
    if (req.body.price || req.body.discountPercentage !== undefined) {
      const price = req.body.price || product.price;
      const discountPercentage = req.body.discountPercentage !== undefined ? 
        req.body.discountPercentage : product.discountPercentage;
      
      req.body.discountedPrice = price * (1 - discountPercentage / 100);
      req.body.isOnDeal = discountPercentage > 0;
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if seller owns the product
    if (product.sellerRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller products
// @route   GET /api/products/seller/my-products
// @access  Private/Seller
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerRef: req.user._id });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search products by title (for multiple sellers)
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Search title is required'
      });
    }
    
    // Find products with similar titles from different sellers
    const products = await Product.find({
      title: { $regex: title, $options: 'i' }
    }).populate('sellerRef', 'name storeName');
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
