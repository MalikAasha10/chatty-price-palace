
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send, Clock, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
}

interface BargainingChatProps {
  sellerId: number;
  sellerName: string;
  initialPrice: number;
  onClose: () => void;
  onPriceChange: (newPrice: number) => void;
}

const BargainingChat: React.FC<BargainingChatProps> = ({
  sellerId,
  sellerName,
  initialPrice,
  onClose,
  onPriceChange
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastOfferAmount, setLastOfferAmount] = useState(initialPrice);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat with a welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: `Hello! I'm a representative from ${sellerName}. How can I help you today?`,
      sender: 'seller',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [sellerName]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Simulate seller typing
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (isTyping) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        respondToOffer();
      }, 2000); // Simulate typing delay
    }
    
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [isTyping]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Check if the message contains a price offer
    const priceMatch = inputValue.match(/\$?(\d+(\.\d{1,2})?)/);
    const isOffer = priceMatch !== null;
    const offerAmount = isOffer ? parseFloat(priceMatch[1]) : undefined;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'buyer',
      timestamp: new Date(),
      isOffer,
      offerAmount
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    if (isOffer && offerAmount) {
      setLastOfferAmount(offerAmount);
      setIsTyping(true);
    } else {
      // If not an offer, respond with a generic message after a delay
      setTimeout(() => {
        const genericResponse: Message = {
          id: messages.length + 2,
          text: "I'm here to discuss the price. Feel free to make an offer!",
          sender: 'seller',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, genericResponse]);
      }, 1500);
    }
  };
  
  const respondToOffer = () => {
    const initialDifference = initialPrice - lastOfferAmount;
    let response: Message;
    
    // If offer is too low (less than 70% of initial price)
    if (lastOfferAmount < initialPrice * 0.7) {
      response = {
        id: messages.length + 1,
        text: `I'm sorry, but $${lastOfferAmount.toFixed(2)} is too low. The lowest I can go is $${(initialPrice * 0.85).toFixed(2)}. Would that work for you?`,
        sender: 'seller',
        timestamp: new Date(),
        isOffer: true,
        offerAmount: initialPrice * 0.85
      };
    } 
    // If offer is reasonable (between 70% and 90% of initial price)
    else if (lastOfferAmount < initialPrice * 0.9) {
      // Meet in the middle
      const counterOffer = lastOfferAmount + (initialDifference / 2);
      response = {
        id: messages.length + 1,
        text: `Thanks for your offer. I can meet you in the middle at $${counterOffer.toFixed(2)}. Does that work for you?`,
        sender: 'seller',
        timestamp: new Date(),
        isOffer: true,
        offerAmount: counterOffer
      };
      // Update the displayed price
      onPriceChange(counterOffer);
    } 
    // If offer is close to asking price (more than 90% of initial)
    else {
      response = {
        id: messages.length + 1,
        text: `Great! I accept your offer of $${lastOfferAmount.toFixed(2)}. Would you like to proceed with this price?`,
        sender: 'seller',
        timestamp: new Date(),
        isOffer: true,
        offerAmount: lastOfferAmount
      };
      // Update the displayed price
      onPriceChange(lastOfferAmount);
    }
    
    setMessages(prevMessages => [...prevMessages, response]);
  };
  
  const handleAcceptOffer = () => {
    const acceptMessage: Message = {
      id: messages.length + 1,
      text: `I accept the offer of $${lastOfferAmount.toFixed(2)}.`,
      sender: 'buyer',
      timestamp: new Date()
    };
    
    const confirmationMessage: Message = {
      id: messages.length + 2,
      text: `Great! Your price has been updated to $${lastOfferAmount.toFixed(2)}. You can now add this to your cart at the new price.`,
      sender: 'seller',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, acceptMessage, confirmationMessage]);
    onPriceChange(lastOfferAmount);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bargain-chat-container">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center">
          <h3 className="font-medium">Bargaining with {sellerName}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bargain-chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex flex-col ${message.sender === 'seller' ? 'items-start' : 'items-end'}`}
          >
            <div className={`chat-bubble ${message.sender === 'seller' ? 'chat-bubble-seller' : 'chat-bubble-buyer'}`}>
              {message.text}
              {message.isOffer && message.offerAmount && (
                <div className="mt-1 font-semibold text-green-600">
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
            <div className="chat-bubble chat-bubble-seller flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>{sellerName} is typing...</span>
            </div>
          </div>
        )}
        
        {/* Last message offer acceptance button */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'seller' && messages[messages.length - 1].isOffer && (
          <div className="flex justify-center my-2">
            <Button 
              className="bg-bargain-light hover:bg-green-600 text-white"
              size="sm"
              onClick={handleAcceptOffer}
            >
              Accept Offer: ${messages[messages.length - 1].offerAmount?.toFixed(2)}
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-3 pt-3 border-t flex items-center">
        <Input
          placeholder="Type a message or make an offer (e.g. $45.99)..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="mr-2"
          disabled={isTyping}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isTyping}
          className="bg-brand-500 hover:bg-brand-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default BargainingChat;
