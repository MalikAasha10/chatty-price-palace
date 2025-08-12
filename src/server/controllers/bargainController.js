
const Bargain = require('../models/Bargain');
const Product = require('../models/Product');

// @desc    Create a new bargaining session
// @route   POST /api/bargain
// @access  Private
exports.createBargainSession = async (req, res) => {
  try {
    const { productId, initialOffer } = req.body;
    
    if (!productId || !initialOffer) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and initial offer are required'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate initial offer - should be less than product price and within 5% discount limit
    const minAcceptablePrice = product.price * 0.95; // 5% discount limit
    if (initialOffer >= product.price) {
      return res.status(400).json({
        success: false,
        message: 'Initial offer must be less than the product price'
      });
    }
    
    if (initialOffer < minAcceptablePrice) {
      return res.status(400).json({
        success: false,
        message: `Offer must be at least $${minAcceptablePrice.toFixed(2)} (maximum 5% discount allowed)`
      });
    }

    // Check if there's an existing active bargaining session
    const existingBargain = await Bargain.findOne({
      productId,
      buyerId: req.user._id,
      status: 'active'
    });

    if (existingBargain) {
      return res.status(200).json({
        success: true,
        message: 'Existing bargaining session found',
        bargain: existingBargain
      });
    }

    // Create a new bargaining session
    const bargain = new Bargain({
      productId,
      buyerId: req.user._id,
      sellerId: product.sellerRef,
      initialPrice: product.price,
      currentPrice: product.price,
      messages: [
        {
          sender: 'buyer',
          text: `I'd like to offer $${initialOffer.toFixed(2)} for this product.`,
          isOffer: true,
          offerAmount: initialOffer
        }
      ]
    });

    await bargain.save();

    res.status(201).json({
      success: true,
      bargain
    });
  } catch (error) {
    console.error('Error creating bargain session:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get buyer's bargaining sessions
// @route   GET /api/bargain/buyer
// @access  Private
exports.getBuyerBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find({ buyerId: req.user._id })
      .populate('productId', 'title images price')
      .populate('sellerId', 'name storeName');
    
    res.status(200).json({
      success: true,
      count: bargains.length,
      bargains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller's bargaining sessions
// @route   GET /api/bargain/seller
// @access  Private/Seller
exports.getSellerBargains = async (req, res) => {
  try {
    const bargains = await Bargain.find({ sellerId: req.user._id })
      .populate('productId', 'title images price')
      .populate('buyerId', 'name');
    
    res.status(200).json({
      success: true,
      count: bargains.length,
      bargains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single bargaining session
// @route   GET /api/bargain/:id
// @access  Private
exports.getBargainSession = async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id)
      .populate('productId', 'title images price')
      .populate('sellerId', 'name storeName')
      .populate('buyerId', 'name');
    
    if (!bargain) {
      return res.status(404).json({
        success: false,
        message: 'Bargaining session not found'
      });
    }
    
    // Check if user is either the buyer or seller
    if (bargain.buyerId.toString() !== req.user._id.toString() && 
        bargain.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this bargaining session'
      });
    }
    
    res.status(200).json({
      success: true,
      bargain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add message to bargaining session
// @route   POST /api/bargain/:id/message
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { text, isOffer, offerAmount } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }
    
    const bargain = await Bargain.findById(req.params.id);
    
    if (!bargain) {
      return res.status(404).json({
        success: false,
        message: 'Bargaining session not found'
      });
    }
    
    // Check if user is either the buyer or seller
    const isBuyer = bargain.buyerId.toString() === req.user._id.toString();
    const isSeller = bargain.sellerId.toString() === req.user._id.toString();
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add messages to this bargaining session'
      });
    }
    
    // Check if bargain is still active
    if (bargain.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This bargain session is no longer active'
      });
    }
    
    // Check message limit (2 messages per user)
    const userMessages = bargain.messages.filter(msg => {
      const sender = msg.sender === 'buyer' ? 'buyer' : 'seller';
      return (sender === 'buyer' && isBuyer) || (sender === 'seller' && isSeller);
    });
    
    if (userMessages.length >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Message limit reached (2 messages per participant)'
      });
    }
    
    // Validate offer amount if it's an offer
    if (isOffer && offerAmount) {
      const minAcceptablePrice = bargain.initialPrice * 0.95; // 5% discount limit
      if (offerAmount < minAcceptablePrice) {
        return res.status(400).json({
          success: false,
          message: `Offer must be at least $${minAcceptablePrice.toFixed(2)} (maximum 5% discount allowed)`
        });
      }
      if (offerAmount >= bargain.initialPrice) {
        return res.status(400).json({
          success: false,
          message: 'Offer must be less than the original price'
        });
      }
    }
    
    // Add message
    const message = {
      sender: isBuyer ? 'buyer' : 'seller',
      text,
      isOffer: isOffer || false,
      offerAmount: offerAmount || undefined,
      timestamp: new Date()
    };
    
    bargain.messages.push(message);
    
    // If it's an offer, update the current price
    if (isOffer && offerAmount) {
      bargain.currentPrice = offerAmount;
    }
    
    bargain.updatedAt = new Date();
    await bargain.save();
    
    res.status(200).json({
      success: true,
      message: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept or reject bargain
// @route   PUT /api/bargain/:id/status
// @access  Private/Seller
exports.updateBargainStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected', 'active', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }
    
    const bargain = await Bargain.findById(req.params.id);
    
    if (!bargain) {
      return res.status(404).json({
        success: false,
        message: 'Bargaining session not found'
      });
    }
    
    // Check if user is the seller
    if (bargain.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can update the bargain status'
      });
    }
    
    bargain.status = status;
    bargain.updatedAt = new Date();
    await bargain.save();
    
    res.status(200).json({
      success: true,
      bargain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

