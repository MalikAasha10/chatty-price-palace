import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product } from './useProducts';

interface SearchResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export const useProductSearch = (searchTerm: string, enabled: boolean = true) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: ['searchProducts', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm.trim()) {
        return { success: true, count: 0, products: [] };
      }
      
      const { data } = await axios.get<SearchResponse>(`/api/products/search?title=${encodeURIComponent(debouncedSearchTerm)}`);
      return data;
    },
    enabled: enabled && debouncedSearchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for getting search suggestions (first few results)
export const useSearchSuggestions = (searchTerm: string) => {
  const { data, isLoading } = useProductSearch(searchTerm, searchTerm.length >= 2);
  
  const suggestions = data?.products?.slice(0, 5) || [];
  
  return {
    suggestions,
    isLoading: isLoading && searchTerm.length >= 2,
    hasResults: suggestions.length > 0
  };
};