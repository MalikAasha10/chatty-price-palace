
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
  isTyping: boolean;
  isConnected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isDisabled,
  isTyping,
  isConnected
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="mt-3 pt-3 border-t flex items-center">
      <Input
        placeholder={isDisabled 
          ? "Chat is unavailable" 
          : "Type a message or make an offer (e.g. $45.99)..."
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="mr-2"
        disabled={isDisabled || isTyping || !isConnected}
      />
      <Button 
        onClick={handleSendMessage} 
        disabled={!inputValue.trim() || isTyping || isDisabled || !isConnected}
        className="bg-brand-500 hover:bg-brand-600"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
