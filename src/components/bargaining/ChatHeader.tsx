
import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BargainStatus from './BargainStatus';

interface ChatHeaderProps {
  sellerName: string;
  bargainStatus: 'active' | 'accepted' | 'rejected' | 'expired';
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ sellerName, bargainStatus, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <MessageCircle className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{sellerName}</h3>
          <div className="flex items-center space-x-2">
            <BargainStatus status={bargainStatus} />
            <span className="text-xs text-gray-500">• Live Chat</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};


export default ChatHeader;
