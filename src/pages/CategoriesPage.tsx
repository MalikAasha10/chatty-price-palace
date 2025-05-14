import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
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

// Sample products data
const productsData = [
  {
    id: 1,
    name: 'Premium Wireless Noise-Cancelling Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.8,
    sellerCount: 7,
    category: 'Electronics',
    subcategory: 'Audio',
    bestSeller: true
  },
  {
    id: 2,
    name: 'Ultra HD Smart TV 55-inch',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6',
    price: 549.99,
    originalPrice: 699.99,
    rating: 4.6,
    sellerCount: 12,
    category: 'Electronics',
    subcategory: 'TVs'
  },
  {
    id: 5,
    name: 'Smart Fitness Watch with Heart Rate Monitor',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.4,
    sellerCount: 6,
    category: 'Electronics',
    subcategory: 'Wearables'
  },
  {
    id: 3,
    name: 'Men\'s Casual Cotton T-Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    price: 24.99,
    originalPrice: 39.99,
    rating: 4.5,
    sellerCount: 15,
    category: 'Fashion',
    subcategory: 'Men\'s Clothing'
  },
  {
    id: 4,
    name: 'Women\'s Running Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.7,
    sellerCount: 8,
    category: 'Fashion',
    subcategory: 'Shoes'
  }
];

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');

  // Filter products based on selection and search
  const filteredProducts = productsData.filter(product => {
    // Filter by category if selected
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    // Filter by subcategory if selected
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-low') {
      return a.price - b.price;
    } else if (sortOrder === 'price-high') {
      return b.price - a.price;
    } else if (sortOrder === 'rating') {
      return b.rating - a.rating;
    }
    // Default is 'featured' - no specific sorting
    return 0;
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
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
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