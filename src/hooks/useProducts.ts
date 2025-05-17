
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ProductImage {
  _id: string;
  url: string;
}

interface Seller {
  _id: string;
  name: string;
  storeName: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  images: ProductImage[] | string[];
  sellerRef: Seller;
  allowBargaining: boolean;
  minAcceptablePrice: number;
  category: string;
  isOnDeal: boolean;
  createdAt: string;
}

interface FeaturedProductsResponse {
  success: boolean;
  featuredProducts: Product[];
  dealsProducts: Product[];
  bargainableProducts: Product[];
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const { data } = await axios.get<FeaturedProductsResponse>('/api/products/featured');
      return data;
    }
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products?category=${category}`);
      return data.products;
    },
    enabled: !!category
  });
};

export const useDealsProducts = () => {
  return useQuery({
    queryKey: ['dealsProducts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/products?deals=true');
      return data.products;
    }
  });
};

export const useBargainableProducts = () => {
  return useQuery({
    queryKey: ['bargainableProducts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/products?bargainable=true');
      return data.products;
    }
  });
};
