
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

export interface ChatItem {
  _id: string;
  buyerName: string;
  productName: string;
  productId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  currentPrice: number;
}

interface SellerChatsListProps {
  chats: ChatItem[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  loading: boolean;
}

const SellerChatsList: React.FC<SellerChatsListProps> = ({
  chats,
  activeChat,
  onChatSelect,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chats...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No bargaining chats yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => (
        <Card 
          key={chat._id}
          className={`mb-2 p-3 cursor-pointer hover:bg-gray-50 ${
            activeChat === chat._id ? 'border-brand-500 bg-brand-50' : ''
          }`}
          onClick={() => onChatSelect(chat._id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="font-medium">{chat.buyerName}</div>
              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                {chat.productName}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
              </div>
              
              {chat.unreadCount > 0 && (
                <Badge className="bg-brand-500 mt-1">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 truncate">
            {chat.lastMessage}
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <Badge className={`${getBadgeColorForStatus(chat.status)}`}>
              {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
            </Badge>
            
            <div className="font-medium text-brand-600">
              ${chat.currentPrice.toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

function getBadgeColorForStatus(status: 'active' | 'accepted' | 'rejected' | 'expired'): string {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'accepted':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'expired':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

export default SellerChatsList;
