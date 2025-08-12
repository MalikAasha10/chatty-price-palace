
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Socket, io as socketIO } from 'socket.io-client';
import axios from 'axios';

// Import the new components
import ChatHeader from './bargaining/ChatHeader';
import MessageList, { MessageType } from './bargaining/MessageList';
import MessageInput from './bargaining/MessageInput';
import ConnectionStatus from './bargaining/ConnectionStatus';

interface BargainingChatProps {
  sellerId: string | number;
  sellerName: string;
  initialPrice: number;
  productId: string;
  onClose: () => void;
  onPriceChange: (newPrice: number) => void;
}

const BargainingChat: React.FC<BargainingChatProps> = ({
  sellerId,
  sellerName,
  initialPrice,
  productId,
  onClose,
  onPriceChange
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastOfferAmount, setLastOfferAmount] = useState(initialPrice);
  const [bargainId, setBargainId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bargainStatus, setBargainStatus] = useState<'active' | 'accepted' | 'rejected' | 'expired'>('active');
  
  const { toast } = useToast();
  
  // Initialize Socket.IO connection
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to use the bargaining feature",
        variant: "destructive"
      });
      return;
    }
    
    // Create socket connection
    const socketInstance = socketIO(undefined, {
      auth: {
        token
      }
    });
    
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Socket.IO server');
      
      // Create or retrieve bargaining session
      createOrGetBargainSession();
    });
    
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from Socket.IO server');
    });
    
    socketInstance.on('error', (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    });
    
    socketInstance.on('message_received', (message) => {
      // Convert timestamp string to Date object
      message.timestamp = new Date(message.timestamp);
      setMessages((prev) => [...prev, message]);
      
      // Update offer amount if it's an offer
      if (message.isOffer && message.offerAmount) {
        setLastOfferAmount(message.offerAmount);
        
        // If it's a seller offer, update the UI price
        if (message.sender === 'seller') {
          onPriceChange(message.offerAmount);
        }
      }
    });
    
    socketInstance.on('status_updated', ({ status }) => {
      setBargainStatus(status);
      
      if (status === 'accepted') {
        toast({
          title: "Offer Accepted!",
          description: `Your offer of $${lastOfferAmount.toFixed(2)} has been accepted! You can now proceed to checkout.`,
          variant: "default"
        });
        
        // Update the product price in UI
        onPriceChange(lastOfferAmount);
        
        // Navigate to checkout after 2 seconds with item data
        setTimeout(() => {
          // Prepare checkout data
          const checkoutItems = [{
            productId: productId,
            title: 'Product',
            price: initialPrice,
            negotiatedPrice: lastOfferAmount,
            quantity: 1,
            image: '/placeholder.svg',
            seller: sellerName
          }];
          
          window.location.href = `/checkout?items=${encodeURIComponent(JSON.stringify(checkoutItems))}`;
        }, 2000);
      } else if (status === 'rejected') {
        toast({
          title: "Offer Rejected",
          description: "The seller has rejected your offer",
          variant: "destructive"
        });
      }
    });
    
    setSocket(socketInstance);
    
    // Clean up on unmount
    return () => {
      if (bargainId) {
        socketInstance.emit('leave_bargain', bargainId);
      }
      socketInstance.disconnect();
    };
  }, []);
  
  // Join bargain room when bargainId is available
  useEffect(() => {
    if (socket && bargainId && isConnected) {
      socket.emit('join_bargain', bargainId);
    }
  }, [socket, bargainId, isConnected]);
  
  // Simulate seller typing
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (isTyping) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000); // Simulate typing delay
    }
    
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [isTyping]);
  
  // Create or get an existing bargain session
  const createOrGetBargainSession = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const response = await axios.post(
        '/api/bargain',
        {
          productId,
          initialOffer: initialPrice * 0.9 // Start with 10% off as initial offer
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const bargainData = response.data.bargain;
        setBargainId(bargainData._id);
        setBargainStatus(bargainData.status);
        
        // Set initial messages
        if (bargainData.messages && bargainData.messages.length > 0) {
          // Convert timestamp strings to Date objects
          const formattedMessages = bargainData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(formattedMessages);
          
          // Find latest offer if exists
          const latestOffer = [...bargainData.messages]
            .reverse()
            .find((msg: any) => msg.isOffer && msg.offerAmount);
          
          if (latestOffer) {
            setLastOfferAmount(latestOffer.offerAmount);
          }
        } else {
          // Add welcome message if no messages exist
          const welcomeMessage: MessageType = {
            text: `Hello! I'm a representative from ${sellerName}. How can I help you today?`,
            sender: 'seller',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Error creating/getting bargain session:', error);
      toast({
        title: "Error",
        description: "Failed to initialize bargaining session",
        variant: "destructive"
      });
    }
  };
  
  const handleSendMessage = (inputValue: string) => {
    if (!inputValue.trim() || !socket || !bargainId) return;
    
    // Check if the message contains a price offer
    const priceMatch = inputValue.match(/\$?(\d+(\.\d{1,2})?)/);
    const isOffer = priceMatch !== null;
    const offerAmount = isOffer ? parseFloat(priceMatch[1]) : undefined;
    
    // Emit message to server via socket
    socket.emit('new_message', {
      bargainId,
      text: inputValue,
      isOffer,
      offerAmount
    });
    
    // Show typing indicator
    if (isOffer) {
      setIsTyping(true);
    }
  };
  
  const handleAcceptOffer = () => {
    if (!socket || !bargainId) return;
    
    // Send acceptance message
    socket.emit('new_message', {
      bargainId,
      text: `I accept the offer of $${lastOfferAmount.toFixed(2)}.`,
      isOffer: false
    });
    
    // Update price in UI
    onPriceChange(lastOfferAmount);
    
    // Show success message
    toast({
      title: "Offer Accepted",
      description: `You've accepted the offer of $${lastOfferAmount.toFixed(2)}`,
      variant: "default"
    });
  };
  
  // Disable chat if bargain is not active
  const isChatDisabled = bargainStatus !== 'active';

  return (
    <Card className="bargain-chat-container">
      <ChatHeader 
        sellerName={sellerName} 
        bargainStatus={bargainStatus} 
        onClose={onClose} 
      />
      
      <MessageList 
        messages={messages}
        isTyping={isTyping}
        sellerName={sellerName}
        bargainStatus={bargainStatus}
        lastOfferAmount={lastOfferAmount}
        onAcceptOffer={handleAcceptOffer}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        isDisabled={isChatDisabled}
        isTyping={isTyping}
        isConnected={isConnected}
      />
      
      <ConnectionStatus isConnected={isConnected} />
    </Card>
  );
};

export default BargainingChat;
