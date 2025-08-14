const BrowseHistory = require('../models/BrowseHistory');

// @desc    Get user's browse history
// @route   GET /api/history/user/:userId
// @access  Private
exports.getBrowseHistory = async (req, res) => {
  try {
    // Check if the requesting user is trying to access their own history
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own browse history'
      });
    }

    const history = await BrowseHistory.find({ userId: req.params.userId })
      .populate('productId', 'name image price')
      .sort({ viewedAt: -1 })
      .limit(50); // Limit to last 50 viewed items

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add item to browse history
// @route   POST /api/history
// @access  Private
exports.addBrowseHistory = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Check if the product was already viewed recently (within last 24 hours)
    const recentView = await BrowseHistory.findOne({
      userId,
      productId,
      viewedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (!recentView) {
      // Create new history entry
      await BrowseHistory.create({
        userId,
        productId,
        viewedAt: new Date()
      });
    } else {
      // Update the viewed time
      recentView.viewedAt = new Date();
      await recentView.save();
    }

    res.status(201).json({
      success: true,
      message: 'Browse history updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};