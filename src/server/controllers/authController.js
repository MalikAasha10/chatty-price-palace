const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Generate JWT Token
const generateToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a user
// @route   POST /api/auth/user/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      type: 'user'
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          type: user.type
        },
        token: generateToken(user._id, user.type)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/user/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type
      },
      token: generateToken(user._id, user.type)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register a seller
// @route   POST /api/auth/seller/register
// @access  Public
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    // Check if seller already exists
    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
      return res.status(400).json({
        success: false,
        message: 'Seller already exists'
      });
    }

    // Create new seller
    const seller = await Seller.create({
      name,
      email,
      password,
      storeName,
      type: 'seller'
    });

    if (seller) {
      res.status(201).json({
        success: true,
        seller: {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          storeName: seller.storeName,
          type: seller.type
        },
        token: generateToken(seller._id, seller.type)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login seller
// @route   POST /api/auth/seller/login
// @access  Public
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for seller
    const seller = await Seller.findOne({ email }).select('+password');

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await seller.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
        type: seller.type
      },
      token: generateToken(seller._id, seller.type)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};