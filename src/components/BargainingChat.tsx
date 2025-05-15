import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send, Clock, Loader2, DollarSign, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Socket, io as socketIO } from 'socket.io-client';
import axios from 'axios';

interface Message {
  id?: number;
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastOfferAmount, setLastOfferAmount] = useState(initialPrice);
  const [bargainId, setBargainId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bargainStatus, setBargainStatus] = useState<'active' | 'accepted' | 'rejected' | 'expired'>('active');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    const socketInstance = socketIO('http://localhost:5000', {
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
          description: `Your offer of $${lastOfferAmount.toFixed(2)} has been accepted!`,
          variant: "default"
        });
        
        // Update the product price in UI
        onPriceChange(lastOfferAmount);
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
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
        'http://localhost:5000/api/bargain',
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
          const welcomeMessage: Message = {
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
  
  const handleSendMessage = () => {
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
    
    setInputValue('');
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
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Disable chat if bargain is not active
  const isChatDisabled = bargainStatus !== 'active';

  return (
    <Card className="bargain-chat-container">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center">
          <h3 className="font-medium">Bargaining with {sellerName}</h3>
          {bargainStatus !== 'active' && (
            <div className="ml-2">
              <Badge status={bargainStatus} />
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bargain-chat-messages h-80 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex flex-col mb-3 ${message.sender === 'seller' ? 'items-start' : 'items-end'}`}
          >
            <div className={`chat-bubble max-w-[80%] p-3 rounded-lg ${
              message.sender === 'seller' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-brand-500 text-white'
            }`}>
              {message.text}
              {message.isOffer && message.offerAmount && (
                <div className={`mt-1 font-semibold flex items-center ${
                  message.sender === 'seller' ? 'text-green-600' : 'text-white'
                }`}>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Offer: ${message.offerAmount.toFixed(2)}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start">
            <div className="chat-bubble bg-gray-100 p-3 rounded-lg flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>{sellerName} is typing...</span>
            </div>
          </div>
        )}
        
        {/* Last message offer acceptance button */}
        {messages.length > 0 && 
          messages[messages.length - 1].sender === 'seller' && 
          messages[messages.length - 1].isOffer && 
          bargainStatus === 'active' && (
            <div className="flex justify-center my-2">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                size="sm"
                onClick={handleAcceptOffer}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept Offer: ${messages[messages.length - 1].offerAmount?.toFixed(2)}
              </Button>
            </div>
          )}
        
        {/* Bargain status messages */}
        {bargainStatus === 'accepted' && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg my-2 text-center">
            <Check className="h-5 w-5 mx-auto mb-1" />
            <p className="font-medium">Offer Accepted!</p>
            <p className="text-sm">Your price has been updated to ${lastOfferAmount.toFixed(2)}</p>
          </div>
        )}
        
        {bargainStatus === 'rejected' && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg my-2 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-1" />
            <p className="font-medium">Offer Rejected</p>
            <p className="text-sm">The seller has declined your offer</p>
          </div>
        )}
        
        {bargainStatus === 'expired' && (
          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg my-2 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1" />
            <p className="font-medium">Offer Expired</p>
            <p className="text-sm">This bargaining session has expired</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-3 pt-3 border-t flex items-center">
        <Input
          placeholder={isChatDisabled 
            ? "Chat is unavailable" 
            : "Type a message or make an offer (e.g. $45.99)..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="mr-2"
          disabled={isChatDisabled || isTyping || !isConnected}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isTyping || isChatDisabled || !isConnected}
          className="bg-brand-500 hover:bg-brand-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {!isConnected && (
        <div className="mt-2 text-center text-sm text-red-500 flex items-center justify-center">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Connecting to chat server...
        </div>
      )}
    </Card>
  );
};

// Badge component for bargain status
const Badge = ({ status }: { status: string }) => {
  let color;
  let label;
  
  switch (status) {
    case 'accepted':
      color = 'bg-green-100 text-green-800';
      label = 'Accepted';
      break;
    case 'rejected':
      color = 'bg-red-100 text-red-800';
      label = 'Rejected';
      break;
    case 'expired':
      color = 'bg-gray-100 text-gray-700';
      label = 'Expired';
      break;
    default:
      color = 'bg-blue-100 text-blue-800';
      label = 'Active';
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
};

export default BargainingChat;
