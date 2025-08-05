import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useProductsByCategory } from '@/hooks/useProducts';
import { Product } from '@/hooks/useProducts';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Sample categories with subcategories
const categoriesData = [
  {
    id: 1,
    name: 'Electronics',
    icon: '🔌',
    color: 'bg-blue-100 text-blue-800',
    subcategories: ['Laptops', 'Smartphones', 'Audio', 'Cameras', 'Accessories']
  },
  {
    id: 2,
    name: 'Fashion',
    icon: '👕',
    color: 'bg-pink-100 text-pink-800',
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Watches', 'Jewelry']
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    icon: '🏠',
    color: 'bg-amber-100 text-amber-800',
    subcategories: ['Furniture', 'Appliances', 'Cookware', 'Bedding', 'Decor']
  },
  {
    id: 4,
    name: 'Sports & Outdoors',
    icon: '🏀',
    color: 'bg-green-100 text-green-800',
    subcategories: ['Fitness', 'Camping', 'Cycling', 'Team Sports', 'Water Sports']
  },
  {
    id: 5,
    name: 'Beauty',
    icon: '💄',
    color: 'bg-purple-100 text-purple-800',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Tools']
  },
  {
    id: 6, 
    name: 'Books',
    icon: '📚',
    color: 'bg-yellow-100 text-yellow-800',
    subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Children\'s Books'] 
  },
  {
    id: 7,
    name: 'Toys & Games',
    icon: '🎮',
    color: 'bg-red-100 text-red-800',
    subcategories: ['Board Games', 'Puzzles', 'Action Figures', 'Educational Toys', 'Outdoor Toys']
  }
];


const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');

  // Fetch products using the API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/products?category=${selectedCategory}`
        : '/api/products';
      const response = await fetch(url);
      const data = await response.json();
      return data.products || [];
    },
  });

  // Filter products based on search query (category is already filtered by API)
  const filteredProducts = (productsData || []).filter((product: Product) => {
    // Filter by search query
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    if (sortOrder === 'price-low') {
      return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
    } else if (sortOrder === 'price-high') {
      return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
    } else if (sortOrder === 'rating') {
      // For now, sort by creation date as we don't have ratings
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Default is 'featured' - sort by newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get subcategories for selected category
  const subcategoriesForSelected = selectedCategory 
    ? categoriesData.find(cat => cat.name === selectedCategory)?.subcategories || []
    : [];

  // Function to clear filters
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Browse Categories</h1>
            <div className="flex items-center gap-2">
              {(selectedCategory || selectedSubcategory || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {/* Categories Grid */}
          {!selectedCategory && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {categoriesData.map(category => (
                <button
                  key={category.id}
                  className="flex flex-col items-center p-6 rounded-lg transition-all hover:shadow-md border"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className={`text-4xl p-4 rounded-full mb-3 ${category.color}`}>
                    {category.icon}
                  </div>
                  <span className="font-medium text-gray-800">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.subcategories.length} subcategories</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Active filters */}
          {selectedCategory && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-500">Active filters:</span>
                {selectedCategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedCategory}
                    <button 
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubcategory(null);
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedSubcategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedSubcategory}
                    <button 
                      onClick={() => setSelectedSubcategory(null)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Filter and search controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/4">
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedSubcategory(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categoriesData.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {selectedCategory && (
              <div className="w-full md:w-1/4">
                <Select
                  value={selectedSubcategory || ""}
                  onValueChange={setSelectedSubcategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {subcategoriesForSelected.map(subcategory => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="w-full md:w-1/4">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="mt-8">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-lg text-red-500">Error loading products. Please try again.</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product: Product) => (
                  <ProductCard 
                    key={product._id} 
                    {...product}
                    isBargainable={product.allowBargaining}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-500">No products found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoriesPage;