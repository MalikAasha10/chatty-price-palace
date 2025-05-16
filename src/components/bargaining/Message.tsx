
import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface MessageProps {
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
}

const Message: React.FC<MessageProps> = ({
  text,
  sender,
  timestamp,
  isOffer = false,
  offerAmount
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col mb-3 ${sender === 'seller' ? 'items-start' : 'items-end'}`}>
      <div className={`chat-bubble max-w-[80%] p-3 rounded-lg ${
        sender === 'seller' 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-brand-500 text-white'
      }`}>
        {text}
        {isOffer && offerAmount && (
          <div className={`mt-1 font-semibold flex items-center ${
            sender === 'seller' ? 'text-green-600' : 'text-white'
          }`}>
            <DollarSign className="h-4 w-4 mr-1" />
            Offer: ${offerAmount.toFixed(2)}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {formatTime(timestamp)}
      </div>
    </div>
  );
};

export default Message;
