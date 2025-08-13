import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Star, ThumbsUp, MessageSquare, Shield, Truck, Clock } from 'lucide-react';
import AutoBargainingChat from './AutoBargainingChat';
import AddToCartButton from './AddToCartButton';

interface SellerOfferProps {
  sellerId: number;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  initialPrice: number;
  stock: number;
  fulfillment: 'Seller' | 'BargainBay';
  deliveryDays: number;
  responseRate: number; // percentage
  isPreferredSeller?: boolean;
  productId?: string;
  productTitle?: string;
  discountPercentage?: number;
}

const SellerOffer: React.FC<SellerOfferProps> = ({
  sellerId,
  sellerName,
  sellerRating,
  sellerReviews,
  initialPrice,
  stock,
  fulfillment,
  deliveryDays,
  responseRate,
  isPreferredSeller = false,
  productId = "demo-product-id",
  productTitle = "Product",
  discountPercentage = 5
}) => {
  const navigate = useNavigate();
  const [showBargainingChat, setShowBargainingChat] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  
  const handleBargainClick = () => {
    setShowBargainingChat(true);
  };
  
  const handleCloseChat = () => {
    setShowBargainingChat(false);
  };
  
  const handleAcceptedOffer = async (finalPrice: number) => {
    setCurrentPrice(finalPrice);
    setShowBargainingChat(false);
    
    // Add to cart with bargained price
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please log in to complete this action.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
          bargainedPrice: finalPrice
        })
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Product added to cart at bargained price. You can now proceed to checkout.",
        });
        
        // Navigate to cart page
        navigate('/cart');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`border p-4 mb-4 ${isPreferredSeller ? 'border-brand-400 bg-brand-50' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex flex-col mb-3 md:mb-0">
          <div className="flex items-center mb-1">
            <h3 className="font-medium text-lg">{sellerName}</h3>
            {isPreferredSeller && (
              <Badge className="ml-2 bg-brand-500">Preferred Seller</Badge>
            )}
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center mr-3">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm ml-1">{sellerRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">({sellerReviews})</span>
            </div>
            
            <div className="text-xs text-gray-600 flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              <span>{responseRate}% response rate</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Shield className="h-4 w-4 mr-1" />
            <span className="mr-3">Fulfilled by {fulfillment}</span>
            
            <Truck className="h-4 w-4 mr-1" />
            <span>Delivery in {deliveryDays} days</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-2xl font-semibold text-brand-700 mb-1">${currentPrice.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mb-2">{stock} in stock</div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-brand-400 text-brand-600 hover:bg-brand-50"
              onClick={handleBargainClick}
            >
              <MessageSquare className="h-4 w-4 mr-1" /> Bargain
            </Button>
            
            <AddToCartButton
              productId={productId}
              productTitle={productTitle}
              price={currentPrice}
              size="sm"
              className="bg-brand-500 hover:bg-brand-600"
            />
          </div>
        </div>
      </div>
      
      {showBargainingChat && (
        <div className="mt-4 animate-slide-up">
          <AutoBargainingChat 
            sellerId={sellerId}
            sellerName={sellerName}
            initialPrice={initialPrice}
            productId={productId}
            productTitle={productTitle}
            discountPercentage={discountPercentage}
            onClose={handleCloseChat}
            onAcceptedOffer={handleAcceptedOffer}
          />
        </div>
      )}
    </Card>
  );
};

export default SellerOffer;
