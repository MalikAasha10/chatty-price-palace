import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, X, DollarSign, CheckCircle, XCircle, User, Bot } from 'lucide-react';

interface AutoBargainingChatProps {
  sellerId: string;
  sellerName: string;
  initialPrice: number;
  productId: string;
  productTitle: string;
  bargainThreshold?: number; // Minimum acceptable price for seller
  onClose: () => void;
  onOfferAccepted: (finalPrice: number) => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
}

const AutoBargainingChat: React.FC<AutoBargainingChatProps> = ({
  sellerId,
  sellerName,
  initialPrice,
  productId,
  productTitle,
  bargainThreshold = 0.85, // Default 85% of original price
  onClose,
  onOfferAccepted
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [bargainStatus, setBargainStatus] = useState<'active' | 'accepted' | 'rejected' | 'expired'>('active');
  const [currentOffer, setCurrentOffer] = useState<number | null>(null);
  const [showAddToCart, setShowAddToCart] = useState(false);

  const minAcceptablePrice = initialPrice * bargainThreshold;
  const maxMessages = 3;

  useEffect(() => {
    // Initial seller greeting
    const welcomeMessage: Message = {
      id: 1,
      text: `Hello! I'm ${sellerName}. I see you're interested in our ${productTitle}. What would you like to offer?`,
      sender: 'seller',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [sellerName, productTitle]);

  const storeBargainInDB = async (finalPrice: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Store successful bargain in database with valid sellerId and productId
      const response = await fetch('/api/bargains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId, // MongoDB ObjectId
          sellerId: sellerId,   // MongoDB ObjectId
          initialOffer: finalPrice
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Bargain stored successfully:', data);
        return data;
      } else {
        const errorData = await response.json();
        console.error('Error storing bargain:', errorData);
        throw new Error(errorData.message || 'Failed to store bargain');
      }
    } catch (error) {
      console.error('Error storing bargain:', error);
      throw error;
    }
  };

  const addToCartManually = async (bargainedPrice: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to cart.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          bargainedPrice
        })
      });

      if (response.ok) {
        toast({
          title: "Added to Cart!",
          description: `Product added at bargained price $${bargainedPrice.toFixed(2)}`,
        });
        onClose();
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSellerResponse = (userOffer: number, messageNumber: number): string => {
    
    if (userOffer >= minAcceptablePrice) {
      // Accept offers that meet the threshold
      setBargainStatus('accepted');
      setShowAddToCart(true);
      setTimeout(async () => {
        try {
          await storeBargainInDB(userOffer);
          toast({
            title: "Offer Accepted!",
            description: "The seller has accepted your offer. You can now add it to cart.",
          });
        } catch (error) {
          console.error('Error storing bargain:', error);
        }
      }, 1500);
      return `Great! I can accept your offer of $${userOffer.toFixed(2)}. That's a fair deal!`;
    } else if (messageNumber === 1 || messageNumber === 2) {
      // Counter with a better offer for first two attempts
      const counterOffer = Math.max(minAcceptablePrice, userOffer + (initialPrice - userOffer) * 0.5);
      return `I appreciate your interest! That's a bit too low for me. How about $${counterOffer.toFixed(2)}? That's the best I can do.`;
    } else if (messageNumber === 3) {
      // Final response - accept if within range, reject if too low
      if (userOffer >= minAcceptablePrice) {
        setBargainStatus('accepted');
        setShowAddToCart(true);
        setTimeout(async () => {
          try {
            await storeBargainInDB(userOffer);
            toast({
              title: "Offer Accepted!",
              description: "The seller has accepted your offer. You can now add it to cart.",
            });
          } catch (error) {
            console.error('Error storing bargain:', error);
          }
        }, 1500);
        return `Alright, you've got a deal! I'll accept $${userOffer.toFixed(2)}.`;
      } else {
        setBargainStatus('rejected');
        return `I'm sorry, but I can't go that low. Thank you for your interest!`;
      }
    }
    
    return "Thank you for your offer!";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || messageCount >= maxMessages || bargainStatus !== 'active') return;

    // Check if message contains a price offer
    const priceMatch = inputValue.match(/\$?(\d+(?:\.\d{1,2})?)/);
    const isOffer = priceMatch !== null;
    const offerAmount = isOffer ? parseFloat(priceMatch[1]) : undefined;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'buyer',
      timestamp: new Date(),
      isOffer,
      offerAmount
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMessageCount(prev => prev + 1);
    
    if (offerAmount) {
      setCurrentOffer(offerAmount);
    }

    // Show typing indicator
    setIsTyping(true);

    // Generate seller response after delay
    setTimeout(() => {
      setIsTyping(false);
      
      const response = offerAmount 
        ? generateSellerResponse(offerAmount, messageCount + 1)
        : "I'd be happy to negotiate! Could you please make a specific offer with a dollar amount?";

      const sellerMessage: Message = {
        id: messages.length + 2,
        text: response,
        sender: 'seller',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sellerMessage]);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = () => {
    switch (bargainStatus) {
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">{sellerName}</h3>
            <p className="text-xs text-muted-foreground">Bargaining for {productTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'buyer'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'buyer' ? (
                  <User className="h-3 w-3 mr-1" />
                ) : (
                  <Bot className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs opacity-70">
                  {message.sender === 'buyer' ? 'You' : sellerName}
                </span>
              </div>
              <p className="text-sm">{message.text}</p>
              {message.isOffer && message.offerAmount && (
                <div className="flex items-center mt-2">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">
                    Offer: ${message.offerAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center">
                <Bot className="h-3 w-3 mr-1" />
                <span className="text-xs opacity-70">{sellerName} is typing...</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {bargainStatus === 'active' && messageCount < maxMessages ? (
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Make an offer with $ amount..."
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
            >
              Send
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            {bargainStatus === 'accepted' && showAddToCart ? (
              <div className="space-y-2">
                <div className="text-green-600 font-medium">
                  🎉 Offer accepted!
                </div>
                <Button 
                  onClick={() => addToCartManually(currentOffer || 0)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Add to Cart
                </Button>
              </div>
            ) : bargainStatus === 'rejected' ? (
              <div className="text-red-600">
                ❌ Offer rejected. Try browsing other sellers.
              </div>
            ) : (
              <div className="text-muted-foreground">
                💬 Attempt limit reached ({messageCount}/{maxMessages})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price info - Only show original price */}
      <div className="px-4 pb-4">
        <div className="text-center text-xs text-muted-foreground">
          <span>Original Price: ${initialPrice.toFixed(2)}</span>
          <span className="block mt-1">Attempts: {messageCount}/{maxMessages}</span>
        </div>
      </div>
    </Card>
  );
};

export default AutoBargainingChat;