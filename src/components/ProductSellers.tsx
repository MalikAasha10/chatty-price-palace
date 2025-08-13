import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SellerOffer from './SellerOffer';
import { Card } from '@/components/ui/card';

interface Seller {
  _id: string;
  name: string;
  storeName: string;
  rating?: number;
  reviews?: number;
  responseRate?: number;
}

interface ProductWithSeller {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  minAcceptablePrice?: number;
  sellerRef: Seller;
  stock?: number;
  allowBargaining: boolean;
}

interface ProductSellersProps {
  productId: string;
  productTitle: string;
}

const ProductSellers: React.FC<ProductSellersProps> = ({ productId, productTitle }) => {
  
  // Fetch all products with same title (from different sellers)
  const { data: sellersData, isLoading } = useQuery({
    queryKey: ['product-sellers', productTitle],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/search?title=${encodeURIComponent(productTitle)}`);
      return data;
    },
    enabled: !!productTitle
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const products: ProductWithSeller[] = sellersData?.products || [];
  
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sellers found for this product.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Available from {products.length} seller{products.length > 1 ? 's' : ''}:
      </h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <SellerOffer
            key={`${product._id}-${product.sellerRef._id}`}
            sellerId={product.sellerRef._id}
            sellerName={product.sellerRef.storeName || product.sellerRef.name}
            sellerRating={product.sellerRef.rating || 4.5}
            sellerReviews={product.sellerRef.reviews || 50}
            initialPrice={product.discountedPrice || product.price}
            stock={product.stock || 10}
            fulfillment={index === 0 ? "BargainBay" : "Seller"}
            deliveryDays={index === 0 ? 1 : Math.floor(Math.random() * 3) + 2}
            responseRate={product.sellerRef.responseRate || 95}
            isPreferredSeller={index === 0}
            productId={product._id}
            productTitle={product.title}
            bargainThreshold={
              product.minAcceptablePrice 
                ? product.minAcceptablePrice / product.price 
                : 0.85
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSellers;