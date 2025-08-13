const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  finalPrice: {
    type: Number,
    required: true
  },
  isBargained: {
    type: Boolean,
    default: false
  },
  bargainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bargain'
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'jazzcash', 'easypaisa', 'cash_on_delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  }
});

module.exports = mongoose.model('Order', orderSchema);