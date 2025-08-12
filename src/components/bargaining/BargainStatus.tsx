import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface BargainStatusProps {
  status: 'active' | 'accepted' | 'rejected' | 'expired';
}

const BargainStatus: React.FC<BargainStatusProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Active',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Accepted',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: 'Rejected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Expired',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Unknown',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default BargainStatus;