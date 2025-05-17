
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
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports & Outdoors', 'Beauty', 'Toys & Games', 'Other']
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountedPrice: {
    type: Number,
    default: function() {
      return this.price * (1 - this.discountPercentage / 100);
    }
  },
  isOnDeal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update discounted price when price or discount percentage changes
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discountPercentage')) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
