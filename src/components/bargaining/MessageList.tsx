
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Message from './Message';
import StatusMessage from './StatusMessage';
import OfferAcceptButton from './OfferAcceptButton';

export interface MessageType {
  id?: number;
  text: string;
  sender: 'buyer' | 'seller';
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
}

interface MessageListProps {
  messages: MessageType[];
  isTyping: boolean;
  sellerName: string;
  bargainStatus: 'active' | 'accepted' | 'rejected' | 'expired';
  lastOfferAmount: number;
  onAcceptOffer: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  sellerName,
  bargainStatus,
  lastOfferAmount,
  onAcceptOffer
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, bargainStatus]);

  return (
    <div className="bargain-chat-messages h-80 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <Message
          key={index}
          text={message.text}
          sender={message.sender}
          timestamp={message.timestamp}
          isOffer={message.isOffer}
          offerAmount={message.offerAmount}
        />
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
          <OfferAcceptButton 
            offerAmount={messages[messages.length - 1].offerAmount} 
            onAccept={onAcceptOffer} 
          />
        )}
      
      {/* Bargain status messages */}
      {bargainStatus !== 'active' && (
        <StatusMessage status={bargainStatus} amount={lastOfferAmount} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
