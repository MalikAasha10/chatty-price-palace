
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  if (isConnected) return null;
  
  return (
    <div className="mt-2 text-center text-sm text-red-500 flex items-center justify-center">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      Connecting to chat server...
    </div>
  );
};

export default ConnectionStatus;
