
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative'],
  },
  images: [
    {
      type: String,
      required: [true, 'Please provide at least one product image'],
    },
  ],
  sellerRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  allowBargaining: {
    type: Boolean,
    default: true,
  },
  minAcceptablePrice: {
    type: Number,
    default: function() {
      // Default minimum price is 80% of the listing price
      return this.price * 0.8;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
