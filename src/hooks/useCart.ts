import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    discountedPrice?: number;
    images: Array<{ url: string } | string>;
    sellerRef: {
      _id: string;
      name: string;
      storeName?: string;
    };
  };
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<Cart> => {
      const { data } = await axios.get('/api/cart', {
        headers: getAuthHeaders()
      });
      return data.cart;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data } = await axios.post('/api/cart', 
        { productId, quantity },
        { headers: getAuthHeaders() }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data } = await axios.put(`/api/cart/${itemId}`, 
        { quantity },
        { headers: getAuthHeaders() }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update cart item",
        variant: "destructive",
      });
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await axios.delete(`/api/cart/${itemId}`, {
        headers: getAuthHeaders()
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete('/api/cart', {
        headers: getAuthHeaders()
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Success",
        description: "Cart cleared",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clear cart",
        variant: "destructive",
      });
    }
  });
};