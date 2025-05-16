
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfferAcceptButtonProps {
  offerAmount?: number;
  onAccept: () => void;
}

const OfferAcceptButton: React.FC<OfferAcceptButtonProps> = ({ offerAmount, onAccept }) => {
  if (!offerAmount) return null;
  
  return (
    <div className="flex justify-center my-2">
      <Button 
        className="bg-green-500 hover:bg-green-600 text-white flex items-center"
        size="sm"
        onClick={onAccept}
      >
        <Check className="h-4 w-4 mr-1" />
        Accept Offer: ${offerAmount.toFixed(2)}
      </Button>
    </div>
  );
};

export default OfferAcceptButton;
