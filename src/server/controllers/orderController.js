const Order = require('../models/Order');
const Product = require('../models/Product');
const Bargain = require('../models/Bargain');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    let totalAmount = 0;
    const orderItems = [];

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      let finalPrice = product.discountedPrice || product.price;
      let isBargained = false;
      let bargainId = null;

      // Check if this item was from a bargain
      if (item.bargainId) {
        const bargain = await Bargain.findById(item.bargainId);
        if (bargain && bargain.status === 'accepted') {
          finalPrice = bargain.currentPrice;
          isBargained = true;
          bargainId = bargain._id;
        }
      }

      const orderItem = {
        productId: product._id,
        sellerId: product.sellerRef,
        quantity: item.quantity || 1,
        price: product.price,
        finalPrice: finalPrice,
        isBargained: isBargained,
        bargainId: bargainId
      };

      orderItems.push(orderItem);
      totalAmount += finalPrice * orderItem.quantity;
    }

    // Create the order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    // Populate the order with product and seller details
    await order.populate([
      { path: 'items.productId', select: 'title images category' },
      { path: 'items.sellerId', select: 'name storeName' },
      { path: 'userId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders for a user
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ userId })
      .populate([
        { path: 'items.productId', select: 'title images category' },
        { path: 'items.sellerId', select: 'name storeName' }
      ])
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get a single order
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId })
      .populate([
        { path: 'items.productId', select: 'title images category description' },
        { path: 'items.sellerId', select: 'name storeName' },
        { path: 'items.bargainId' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (seller only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.id;

    // Find order where seller has items
    const order = await Order.findOne({
      _id: id,
      'items.sellerId': sellerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update it'
      });
    }

    // Update the order status
    order.status = status;
    order.updatedAt = new Date();

    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};