import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MessageSquare } from 'lucide-react';

interface BargainOfferButtonProps {
  productTitle: string;
  originalPrice: number;
  buyerName: string;
  onSendOffer: (offerAmount: number, message: string) => void;
  disabled?: boolean;
}

const BargainOfferButton: React.FC<BargainOfferButtonProps> = ({
  productTitle,
  originalPrice,
  buyerName,
  onSendOffer,
  disabled
}) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const minPrice = originalPrice * 0.95; // 5% discount limit
  const maxDiscount = ((originalPrice - minPrice) / originalPrice * 100).toFixed(0);

  const handleSendOffer = () => {
    const amount = parseFloat(offerAmount);
    if (amount < minPrice || amount >= originalPrice) {
      return;
    }

    onSendOffer(amount, message || `Counter offer for ${productTitle}: $${amount.toFixed(2)}`);
    setOfferAmount('');
    setMessage('');
    setIsOpen(false);
  };

  const isValidOffer = () => {
    const amount = parseFloat(offerAmount);
    return amount >= minPrice && amount < originalPrice;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Make Counter Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="offer-description">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Counter Offer to {buyerName}
          </DialogTitle>
          <DialogDescription id="offer-description">
            Send a counter offer for "{productTitle}". Maximum {maxDiscount}% discount allowed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Original Price:</span>
            <Badge variant="outline">${originalPrice.toFixed(2)}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>Minimum Offer:</span>
            <Badge variant="secondary">${minPrice.toFixed(2)}</Badge>
          </div>
          
          <div>
            <Label htmlFor="offerAmount">Your Counter Offer ($)</Label>
            <Input
              id="offerAmount"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder={`Min: ${minPrice.toFixed(2)}`}
              min={minPrice}
              max={originalPrice - 0.01}
              step="0.01"
            />
            {offerAmount && !isValidOffer() && (
              <p className="text-sm text-red-600 mt-1">
                Offer must be between ${minPrice.toFixed(2)} and ${(originalPrice - 0.01).toFixed(2)}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              maxLength={100}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSendOffer} 
              disabled={!isValidOffer()}
              className="flex-1"
            >
              Send Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BargainOfferButton;