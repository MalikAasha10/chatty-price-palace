
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MessageType } from '@/components/bargaining/MessageList';
import { formatDistanceToNow } from 'date-fns';

interface SellerChatBoxProps {
  chatId: string;
  productName: string;
  buyerName: string;
  initialPrice: number;
  currentPrice: number;
  messages: MessageType[];
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  onSendMessage: (chatId: string, message: string, isOffer: boolean, offerAmount?: number) => void;
  onUpdateStatus: (chatId: string, status: 'accepted' | 'rejected') => void;
}

const SellerChatBox: React.FC<SellerChatBoxProps> = ({
  chatId,
  productName,
  buyerName,
  initialPrice,
  currentPrice,
  messages,
  status,
  onSendMessage,
  onUpdateStatus
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState(currentPrice.toFixed(2));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' && !offerMode) return;
    
    if (offerMode) {
      onSendMessage(chatId, `I can offer $${offerAmount} for this product.`, true, parseFloat(offerAmount));
      setOfferMode(false);
    } else {
      onSendMessage(chatId, inputMessage, false);
    }
    
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format the timestamp to relative time (e.g. "5 minutes ago")
  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const isChatDisabled = status !== 'active';

  return (
    <Card className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-3 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{buyerName}</h3>
          <div className="text-sm text-gray-500">{productName}</div>
        </div>
        
        <div className="flex space-x-2">
          {status === 'active' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onUpdateStatus(chatId, 'rejected')}
              >
                Reject
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-green-300 text-green-600 hover:bg-green-50"
                onClick={() => onUpdateStatus(chatId, 'accepted')}
              >
                Accept
              </Button>
            </>
          )}

          <div className="text-right">
            <div className="text-xs text-gray-500">Initial: ${initialPrice.toFixed(2)}</div>
            <div className="font-medium text-brand-600">Current: ${currentPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'seller' 
                ? 'bg-brand-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div>{message.text}</div>
              
              {message.isOffer && message.offerAmount && (
                <div className={`mt-1 font-semibold flex items-center ${
                  message.sender === 'seller' ? 'text-white' : 'text-green-600'
                }`}>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Offer: ${message.offerAmount.toFixed(2)}
                </div>
              )}
              
              <div className={`text-xs mt-1 ${
                message.sender === 'seller' ? 'text-brand-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        {offerMode ? (
          <div className="flex mb-2">
            <div className="relative flex-1 mr-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="number" 
                placeholder="Offer amount" 
                value={offerAmount} 
                onChange={(e) => setOfferAmount(e.target.value)} 
                className="pl-8"
                step="0.01"
                min="0"
              />
            </div>
            <Button 
              variant="outline" 
              className="text-gray-500"
              onClick={() => setOfferMode(false)}
            >
              Cancel
            </Button>
          </div>
        ) : null}

        <div className="flex">
          <Input
            placeholder={isChatDisabled ? "Chat is unavailable" : "Type your message..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mr-2"
            disabled={isChatDisabled || offerMode}
          />

          {!offerMode && status === 'active' && (
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => setOfferMode(true)}
            >
              <DollarSign className="h-4 w-4" />
            </Button>
          )}

          <Button 
            onClick={handleSendMessage} 
            disabled={isChatDisabled || (inputMessage.trim() === '' && !offerMode)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SellerChatBox;
