
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Bargain = require('./models/Bargain');
const Seller = require('./models/Seller');
const User = require('./models/User');

module.exports = function(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join a specific bargain chat room
    socket.on('join_bargain', async (bargainId) => {
      try {
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Check if user is buyer or seller
        if (bargain.buyerId.toString() !== socket.user.id && 
            bargain.sellerId.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Not authorized to join this bargaining session' });
          return;
        }
        
        // Join the bargain room
        socket.join(`bargain:${bargainId}`);
        console.log(`User ${socket.user.id} joined bargain room ${bargainId}`);
      } catch (error) {
        console.error('Error joining bargain room:', error);
        socket.emit('error', { message: 'Failed to join bargaining session' });
      }
    });
    
    // Leave a bargain chat room
    socket.on('leave_bargain', (bargainId) => {
      socket.leave(`bargain:${bargainId}`);
      console.log(`User ${socket.user.id} left bargain room ${bargainId}`);
    });
    
    // Send a new message in the bargain
    socket.on('new_message', async (data) => {
      try {
        const { bargainId, text, isOffer, offerAmount } = data;
        
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Check if user is buyer or seller
        const isBuyer = bargain.buyerId.toString() === socket.user.id;
        const isSeller = bargain.sellerId.toString() === socket.user.id;
        
        if (!isBuyer && !isSeller) {
          socket.emit('error', { message: 'Not authorized to send messages in this bargaining session' });
          return;
        }
        
        // Create the message
        const message = {
          sender: isBuyer ? 'buyer' : 'seller',
          text,
          isOffer: isOffer || false,
          offerAmount,
          timestamp: new Date()
        };
        
        // Add message to the database
        bargain.messages.push(message);
        
        // If it's an offer, update the current price
        if (isOffer && offerAmount) {
          bargain.currentPrice = offerAmount;
        }
        
        bargain.updatedAt = new Date();
        await bargain.save();
        
        // Broadcast the message to everyone in the bargain room
        io.to(`bargain:${bargainId}`).emit('message_received', message);
        
        console.log(`New message in bargain ${bargainId} from ${message.sender}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Update bargain status (accepted, rejected, etc.)
    socket.on('update_status', async (data) => {
      try {
        const { bargainId, status } = data;
        
        if (!bargainId || !status || !['accepted', 'rejected'].includes(status)) {
          socket.emit('error', { message: 'Invalid bargain status update request' });
          return;
        }
        
        const bargain = await Bargain.findById(bargainId);
        
        if (!bargain) {
          socket.emit('error', { message: 'Bargaining session not found' });
          return;
        }
        
        // Only seller can update status
        if (bargain.sellerId.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Only the seller can update bargain status' });
          return;
        }
        
        // Update status
        bargain.status = status;
        bargain.updatedAt = new Date();
        await bargain.save();
        
        // Broadcast status update to everyone in the bargain room
        io.to(`bargain:${bargainId}`).emit('status_updated', { 
          bargainId, 
          status 
        });
        
        console.log(`Bargain ${bargainId} status updated to ${status}`);
      } catch (error) {
        console.error('Error updating bargain status:', error);
        socket.emit('error', { message: 'Failed to update bargain status' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
  
  return io;
};
