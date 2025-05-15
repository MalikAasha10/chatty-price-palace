
const User = require('../models/User');
const Seller = require('../models/Seller');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // Check if the requesting user is trying to access their own profile
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own profile'
      });
    }

    let user;
    if (req.user.type === 'seller') {
      user = await Seller.findById(req.params.id).select('-password');
    } else {
      user = await User.findById(req.params.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // Check if the requesting user is trying to update their own profile
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const { name, email } = req.body;

    let user;
    if (req.user.type === 'seller') {
      user = await Seller.findById(req.params.id);
      
      // Additional seller-specific fields
      if (req.body.storeName) {
        user.storeName = req.body.storeName;
      }
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update common fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/users/:id/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    // Check if the requesting user is trying to access their own orders
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own orders'
      });
    }

    // For now, we'll return mock orders
    // In a real implementation, you would fetch from an Orders collection
    const orders = [
      {
        id: '12345',
        date: '2025-05-01',
        status: 'Delivered',
        total: 125.99,
        items: [
          { id: 'p1', name: 'Wireless Headphones', price: 89.99, quantity: 1 },
          { id: 'p2', name: 'Phone Case', price: 35.99, quantity: 1 }
        ]
      },
      {
        id: '12346',
        date: '2025-04-22',
        status: 'In Transit',
        total: 89.99,
        items: [
          { id: 'p3', name: 'Smart Watch', price: 89.99, quantity: 1 }
        ]
      },
      {
        id: '12347',
        date: '2025-03-15',
        status: 'Processing',
        total: 45.50,
        items: [
          { id: 'p4', name: 'USB Cable', price: 15.99, quantity: 1 },
          { id: 'p5', name: 'Power Bank', price: 29.51, quantity: 1 }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/:id/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    // Check if the requesting user is trying to change their own password
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    let user;
    if (req.user.type === 'seller') {
      user = await Seller.findById(req.params.id).select('+password');
    } else {
      user = await User.findById(req.params.id).select('+password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
