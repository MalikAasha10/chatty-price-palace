const Order = require('../models/Order');
const Product = require('../models/Product');
const Bargain = require('../models/Bargain');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { cartItems, shippingDetails, paymentMethod, paymentStatus, transactionId } = req.body;
    const userId = req.user._id;

    // Validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'cartItems is required and must be a non-empty array'
      });
    }

    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.address || !shippingDetails.phone || !shippingDetails.email) {
      return res.status(400).json({
        success: false,
        message: 'shippingDetails is required with fullName, address, phone, and email'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'paymentMethod is required'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process each cart item
    for (const item of cartItems) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each cart item must have productId, quantity, and price'
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      let finalPrice = item.price;
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
        quantity: item.quantity,
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
      shippingAddress: {
        fullName: shippingDetails.fullName,
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zipCode: shippingDetails.zipCode,
        country: shippingDetails.country || 'Pakistan'
      },
      paymentMethod,
      status: 'Pending'
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
    const userId = req.user._id;
    
    const orders = await Order.find({ userId })
      .populate([
        { path: 'items.productId', select: 'title images category' },
        { path: 'items.sellerId', select: 'name storeName' }
      ])
      .sort({ createdAt: -1 });

    res.json(orders);

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
    const userId = req.user._id;

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
    const sellerId = req.user._id;

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