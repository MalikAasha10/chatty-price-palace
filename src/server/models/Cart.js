const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update totalPrice before saving
cartSchema.pre('save', async function(next) {
  if (this.items && this.items.length > 0) {
    await this.populate('items.productId');
    
    this.totalPrice = this.items.reduce((total, item) => {
      const price = item.productId.discountedPrice || item.productId.price;
      return total + (price * item.quantity);
    }, 0);
  } else {
    this.totalPrice = 0;
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);