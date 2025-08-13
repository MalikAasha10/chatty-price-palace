const mongoose = require('mongoose');

const browseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
browseHistorySchema.index({ userId: 1, viewedAt: -1 });
browseHistorySchema.index({ userId: 1, productId: 1 });

module.exports = mongoose.model('BrowseHistory', browseHistorySchema);