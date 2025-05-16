
import React from 'react';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface StatusMessageProps {
  status: 'accepted' | 'rejected' | 'expired';
  amount?: number;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status, amount }) => {
  switch (status) {
    case 'accepted':
      return (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg my-2 text-center">
          <Check className="h-5 w-5 mx-auto mb-1" />
          <p className="font-medium">Offer Accepted!</p>
          {amount && (
            <p className="text-sm">Your price has been updated to ${amount.toFixed(2)}</p>
          )}
        </div>
      );
    case 'rejected':
      return (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg my-2 text-center">
          <AlertCircle className="h-5 w-5 mx-auto mb-1" />
          <p className="font-medium">Offer Rejected</p>
          <p className="text-sm">The seller has declined your offer</p>
        </div>
      );
    case 'expired':
      return (
        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg my-2 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1" />
          <p className="font-medium">Offer Expired</p>
          <p className="text-sm">This bargaining session has expired</p>
        </div>
      );
    default:
      return null;
  }
};

export default StatusMessage;
