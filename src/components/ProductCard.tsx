
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string | number;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  rating: number;
  sellerCount: number;
  category: string;
  bestSeller?: boolean;
  isBargainable?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  imageUrl,
  price,
  originalPrice,
  rating,
  sellerCount,
  category,
  bestSeller = false,
  isBargainable = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  return (
    <Link 
      to={`/product/${id}`}
      className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl || "/placeholder.svg"} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {bestSeller && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-amber-500 text-white px-2 py-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs font-medium">Best Seller</span>
            </Badge>
          </div>
        )}

        {isBargainable && (
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {bestSeller && <div className="mb-1"></div>} {/* Spacer if best seller badge exists */}
            <Badge className="bg-blue-500 text-white px-2 py-1 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span className="text-xs font-medium">Bargainable</span>
            </Badge>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 text-white px-2">
              -{discount}%
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <span>{category}</span>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">{name}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'})</span>
          </div>
        </div>
        
        <div className="flex items-baseline mb-1">
          <span className="text-lg font-semibold text-brand-600">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        <Button 
          className={`w-full mt-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-80'} bg-brand-500 hover:bg-brand-600`}
          size="sm"
        >
          View Offers
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;
