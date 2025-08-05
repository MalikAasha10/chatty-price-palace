
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  _id?: string;
  id?: string | number;
  title?: string;
  name?: string;
  images?: string[] | Array<{url: string}>;
  imageUrl?: string;
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  originalPrice?: number;
  rating?: number;
  sellerCount?: number;
  category: string;
  bestSeller?: boolean;
  isBargainable?: boolean;
  allowBargaining?: boolean;
  sellerRef?: {
    name: string;
    storeName: string;
  };
  isOnDeal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle both old and new prop structures
  const productId = props._id || props.id;
  const productName = props.title || props.name || '';
  const productPrice = props.discountedPrice || props.price;
  const originalPrice = props.price !== props.discountedPrice ? props.price : props.originalPrice;
  const discount = props.discountPercentage || (originalPrice ? Math.round((1 - productPrice / originalPrice) * 100) : 0);
  const isBargainable = props.allowBargaining || props.isBargainable || false;
  const rating = props.rating || 4.5; // Default rating if not provided
  const sellerName = props.sellerRef?.storeName || props.sellerRef?.name || 'Unknown Seller';
  
  // Get first image URL
  let imageUrl = props.imageUrl;
  if (!imageUrl && props.images && props.images.length > 0) {
    const firstImage = props.images[0];
    imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
  }
  imageUrl = imageUrl || "/placeholder.svg";
  
  return (
    <Link 
      to={`/product/${productId}`}
      className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {props.bestSeller && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-amber-500 text-white px-2 py-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs font-medium">Best Seller</span>
            </Badge>
          </div>
        )}

        {isBargainable && (
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {props.bestSeller && <div className="mb-1"></div>} {/* Spacer if best seller badge exists */}
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
          <span>{props.category}</span>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">{productName}</h3>
        
        {/* Seller Information */}
        <div className="text-xs text-gray-500 mb-2">
          Sold by: <span className="font-medium">{sellerName}</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-baseline mb-1">
          <span className="text-lg font-semibold text-brand-600">${productPrice.toFixed(2)}</span>
          {originalPrice && originalPrice !== productPrice && (
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
