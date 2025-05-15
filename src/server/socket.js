
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Bargain = require('./models/Bargain');
const User = require('./models/User');
const Seller = require('./models/Seller');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.userId = decoded.id;
      socket.userType = user.role;
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join a bargaining room based on bargain ID
    socket.on('join_bargain', async (bargainId) => {
      try {
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Check if user is either buyer or seller
        if (bargain.buyerId.toString() !== socket.userId && 
            bargain.sellerId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Not authorized to join this bargaining session' });
          return;
        }
        
        // Join the room
        socket.join(`bargain-${bargainId}`);
        console.log(`User ${socket.userId} joined bargain room ${bargainId}`);
        
        // Notify other participants
        const userRole = bargain.buyerId.toString() === socket.userId ? 'Buyer' : 'Seller';
        socket.to(`bargain-${bargainId}`).emit('user_joined', { 
          userId: socket.userId,
          userRole
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Leave a bargaining room
    socket.on('leave_bargain', (bargainId) => {
      socket.leave(`bargain-${bargainId}`);
      console.log(`User ${socket.userId} left bargain room ${bargainId}`);
    });
    
    // New message event
    socket.on('new_message', async (data) => {
      try {
        const { bargainId, text, isOffer, offerAmount } = data;
        
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Check if user is either buyer or seller
        const isBuyer = bargain.buyerId.toString() === socket.userId;
        const isSeller = bargain.sellerId.toString() === socket.userId;
        
        if (!isBuyer && !isSeller) {
          socket.emit('error', { message: 'Not authorized to send messages to this bargaining session' });
          return;
        }
        
        // Create message
        const message = {
          sender: isBuyer ? 'buyer' : 'seller',
          text,
          isOffer: isOffer || false,
          offerAmount: offerAmount || undefined,
          timestamp: new Date()
        };
        
        // Save message to database
        bargain.messages.push(message);
        
        // If it's an offer, update the current price
        if (isOffer && offerAmount) {
          bargain.currentPrice = offerAmount;
        }
        
        bargain.updatedAt = new Date();
        await bargain.save();
        
        // Broadcast message to room
        io.to(`bargain-${bargainId}`).emit('message_received', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Update bargain status event (seller only)
    socket.on('update_status', async (data) => {
      try {
        const { bargainId, status } = data;
        
        if (!status || !['accepted', 'rejected', 'active', 'expired'].includes(status)) {
          socket.emit('error', { message: 'Valid status is required' });
          return;
        }
        
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Check if user is the seller
        if (bargain.sellerId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only the seller can update bargain status' });
          return;
        }
        
        // Update status
        bargain.status = status;
        bargain.updatedAt = new Date();
        await bargain.save();
        
        // Broadcast status change
        io.to(`bargain-${bargainId}`).emit('status_updated', {
          status,
          updatedAt: bargain.updatedAt
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
  
  return io;
};
