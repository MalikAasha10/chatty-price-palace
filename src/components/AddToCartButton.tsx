import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';
import { toast } from '@/components/ui/use-toast';

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: number;
  bargainedPrice?: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productTitle,
  price,
  bargainedPrice,
  disabled = false,
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    
    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity: 1,
        bargainedPrice
      });
      
      toast({
        title: "Added to Cart",
        description: `${productTitle} has been added to your cart${bargainedPrice ? ' at bargained price' : ''}.`,
      });
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || addToCartMutation.isPending}
      variant={variant}
      size={size}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding || addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
      {bargainedPrice && (
        <span className="ml-1 text-xs">
          (${bargainedPrice.toFixed(2)})
        </span>
      )}
    </Button>
  );
};

export default AddToCartButton;