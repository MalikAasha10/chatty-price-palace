const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'seller') {
      req.user = await Seller.findById(decoded.id);
    } else {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found with this ID'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user is a seller
exports.sellerOnly = (req, res, next) => {
  if (req.user.type !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'This route is accessible to sellers only'
    });
  }
  next();
};

// Check if user is a regular user
exports.userOnly = (req, res, next) => {
  if (req.user.type !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'This route is accessible to users only'
    });
  }
  next();
};