import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

export interface BargainMessage {
  _id: string;
  sender: 'buyer' | 'seller';
  text: string;
  isOffer: boolean;
  offerAmount?: number;
  timestamp: string;
}

export interface Bargain {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    discountedPrice?: number;
    images: string[];
    sellerRef: {
      _id: string;
      name: string;
      storeName?: string;
    };
  };
  buyerId: string;
  sellerId: string;
  initialPrice: number;
  currentPrice: number;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  messages: BargainMessage[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new bargain session
export const useCreateBargain = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      sellerId, 
      initialPrice, 
      offerAmount 
    }: { 
      productId: string; 
      sellerId: string; 
      initialPrice: number; 
      offerAmount: number; 
    }) => {
      const { data } = await axios.post('/api/bargains', 
        { productId, sellerId, initialPrice, offerAmount },
        { headers: getAuthHeaders() }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bargains'] });
      toast({
        title: "Success",
        description: "Bargain session started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start bargain",
        variant: "destructive",
      });
    }
  });
};

// Get buyer's bargain sessions
export const useBuyerBargains = () => {
  return useQuery({
    queryKey: ['bargains', 'buyer'],
    queryFn: async (): Promise<Bargain[]> => {
      const { data } = await axios.get('/api/bargains/buyer', {
        headers: getAuthHeaders()
      });
      return data.bargains;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

// Get a specific bargain session
export const useBargainSession = (bargainId: string) => {
  return useQuery({
    queryKey: ['bargain', bargainId],
    queryFn: async (): Promise<Bargain> => {
      const { data } = await axios.get(`/api/bargains/${bargainId}`, {
        headers: getAuthHeaders()
      });
      return data.bargain;
    },
    enabled: !!bargainId && !!localStorage.getItem('token'),
  });
};

// Add message to bargain session
export const useAddBargainMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      bargainId, 
      text, 
      isOffer, 
      offerAmount 
    }: { 
      bargainId: string; 
      text: string; 
      isOffer?: boolean; 
      offerAmount?: number; 
    }) => {
      const { data } = await axios.post(`/api/bargains/${bargainId}/message`, 
        { text, isOffer, offerAmount },
        { headers: getAuthHeaders() }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bargain', variables.bargainId] });
      queryClient.invalidateQueries({ queryKey: ['bargains'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });
};

// Update bargain status (seller only)
export const useUpdateBargainStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      bargainId, 
      status 
    }: { 
      bargainId: string; 
      status: 'accepted' | 'rejected' | 'active' | 'expired'; 
    }) => {
      const { data } = await axios.put(`/api/bargains/${bargainId}/status`, 
        { status },
        { headers: getAuthHeaders() }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bargain', variables.bargainId] });
      queryClient.invalidateQueries({ queryKey: ['bargains'] });
      
      if (variables.status === 'accepted') {
        toast({
          title: "Success",
          description: "Bargain accepted! Product will be added to cart.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update bargain status",
        variant: "destructive",
      });
    }
  });
};