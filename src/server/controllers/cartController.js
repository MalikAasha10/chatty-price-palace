const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        populate: {
          path: 'sellerRef',
          select: 'name storeName'
        }
      });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, bargainedPrice } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      // Update bargained price if provided
      if (bargainedPrice) {
        cart.items[existingItemIndex].bargainedPrice = bargainedPrice;
      }
    } else {
      // Add new item
      const cartItem = { productId, quantity };
      if (bargainedPrice) {
        cartItem.bargainedPrice = bargainedPrice;
      }
      cart.items.push(cartItem);
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'sellerRef',
        select: 'name storeName'
      }
    });

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    item.quantity = quantity;
    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'sellerRef',
        select: 'name storeName'
      }
    });

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'sellerRef',
        select: 'name storeName'
      }
    });

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};