import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  className, 
  placeholder = "Search products..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { suggestions, isLoading, hasResults } = useSearchSuggestions(searchTerm);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (productId: string, title: string) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pr-20 rounded-lg border border-input"
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
        />
        
        <div className="absolute right-0 top-0 h-full flex items-center">
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-full px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            type="submit"
            variant="ghost" 
            size="icon" 
            className="h-full px-3"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (searchTerm.length >= 2) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {suggestions.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product._id, product.title)}
                  className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={Array.isArray(product.images) && product.images.length > 0 
                        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) 
                        : '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {product.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${product.discountPercentage > 0 ? product.discountedPrice : product.price}
                      {product.category && ` • ${product.category}`}
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Show all results option */}
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                    setShowSuggestions(false);
                    inputRef.current?.blur();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  See all results for "{searchTerm}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No products found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;