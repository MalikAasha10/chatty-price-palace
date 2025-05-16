
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  sellerName: string;
  bargainStatus: 'active' | 'accepted' | 'rejected' | 'expired';
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ sellerName, bargainStatus, onClose }) => {
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b">
      <div className="flex items-center">
        <h3 className="font-medium">Bargaining with {sellerName}</h3>
        {bargainStatus !== 'active' && (
          <div className="ml-2">
            <StatusBadge status={bargainStatus} />
          </div>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
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

export default ChatHeader;
