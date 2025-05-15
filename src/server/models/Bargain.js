
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  offerAmount: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const bargainSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  initialPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected', 'expired'],
    default: 'active'
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Bargaining sessions expire after 24 hours by default
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }
  }
});

module.exports = mongoose.model('Bargain', bargainSchema);
