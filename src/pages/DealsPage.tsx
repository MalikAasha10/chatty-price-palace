
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Flame, HandCoins, Percent, ShoppingBag, Tag, Timer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDealsProducts, useBargainableProducts } from '@/hooks/useProducts';
import { Product } from '@/hooks/useProducts';

// Sample deal products data
const bargainProducts = [
  {
    id: 101,
    name: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.8,
    sellerCount: 7,
    category: 'Electronics',
    bestSeller: true,
    isBargainable: true
  },
  {
    id: 102,
    name: 'Samsung 55" QLED 4K Smart TV',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6',
    price: 799.99,
    originalPrice: 999.99,
    rating: 4.6,
    sellerCount: 5,
    category: 'Electronics',
    isBargainable: true
  },
  {
    id: 103,
    name: 'Leather Office Chair with Ergonomic Design',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1',
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.5,
    sellerCount: 3,
    category: 'Furniture',
    isBargainable: true
  },
  {
    id: 104,
    name: 'Professional DSLR Camera with Dual Lens Kit',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',
    price: 1199.99,
    originalPrice: 1499.99,
    rating: 4.9,
    sellerCount: 4,
    category: 'Photography',
    bestSeller: true,
    isBargainable: true
  }
];

const limitedTimeDeals = [
  {
    id: 201,
    name: 'Apple Watch Series 7',
    imageUrl: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf',
    price: 329.99,
    originalPrice: 399.99,
    rating: 4.7,
    sellerCount: 6,
    category: 'Wearables',
    endsIn: 12, // hours
    discountPercent: 18
  },
  {
    id: 202,
    name: 'Dyson V11 Cordless Vacuum Cleaner',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001',
    price: 499.99,
    originalPrice: 699.99,
    rating: 4.8,
    sellerCount: 3,
    category: 'Home Appliances',
    endsIn: 6, // hours
    discountPercent: 29
  },
  {
    id: 203,
    name: 'KitchenAid Stand Mixer',
    imageUrl: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00',
    price: 299.99,
    originalPrice: 449.99,
    rating: 4.9,
    sellerCount: 5,
    category: 'Kitchen Appliances',
    endsIn: 24, // hours
    discountPercent: 33
  },
  {
    id: 204,
    name: 'Nintendo Switch OLED Model',
    imageUrl: 'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d',
    price: 329.99,
    originalPrice: 349.99,
    rating: 4.8,
    sellerCount: 8,
    category: 'Gaming',
    endsIn: 48, // hours
    discountPercent: 6
  }
];

const hotDeals = [
  {
    id: 301,
    name: 'iPad Pro 11-inch',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    price: 749.99,
    originalPrice: 799.99,
    rating: 4.9,
    sellerCount: 12,
    category: 'Electronics',
    offers: 89,
    views: 1250
  },
  {
    id: 302,
    name: 'Bose QuietComfort 45 Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29',
    price: 279.99,
    originalPrice: 329.99,
    rating: 4.7,
    sellerCount: 9,
    category: 'Audio',
    offers: 67,
    views: 980
  },
  {
    id: 303,
    name: 'Le Creuset Dutch Oven',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62',
    price: 299.99,
    originalPrice: 379.99,
    rating: 4.8,
    sellerCount: 5,
    category: 'Kitchen',
    offers: 45,
    views: 730
  },
  {
    id: 304,
    name: 'Samsung Galaxy S22 Ultra',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
    price: 999.99,
    originalPrice: 1199.99,
    rating: 4.6,
    sellerCount: 14,
    category: 'Phones',
    offers: 120,
    views: 1870
  }
];

const flashSales = [
  {
    id: 401,
    name: 'Instant Pot Duo 7-in-1',
    imageUrl: 'https://images.unsplash.com/photo-1593704399522-8e8c6c3a1d0c',
    price: 79.99,
    originalPrice: 129.99,
    rating: 4.8,
    sellerCount: 4,
    category: 'Kitchen Appliances',
    endsIn: 3, // hours
    discountPercent: 38
  },
  {
    id: 402,
    name: 'Fitbit Charge 5',
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288',
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.6,
    sellerCount: 7,
    category: 'Wearables',
    endsIn: 5, // hours
    discountPercent: 28
  },
  {
    id: 403,
    name: 'Kindle Paperwhite',
    imageUrl: 'https://images.unsplash.com/photo-1585158531004-3224babed121',
    price: 99.99,
    originalPrice: 139.99,
    rating: 4.7,
    sellerCount: 6,
    category: 'Electronics',
    endsIn: 8, // hours
    discountPercent: 29
  },
  {
    id: 404,
    name: 'Philips Hue Smart Lighting Starter Kit',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827',
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.5,
    sellerCount: 5,
    category: 'Smart Home',
    endsIn: 12, // hours
    discountPercent: 25
  }
];

// Category-based deals
const categoryDeals = {
  "Electronics": [
    {
      id: 501,
      name: '4K Streaming Media Player',
      imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575',
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.5,
      sellerCount: 8,
      category: 'Electronics',
      discountPercent: 20
    },
    {
      id: 502,
      name: 'Wireless Gaming Mouse',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
      price: 49.99,
      originalPrice: 69.99,
      rating: 4.7,
      sellerCount: 6,
      category: 'Electronics',
      discountPercent: 29
    }
  ],
  "Fashion": [
    {
      id: 503,
      name: 'Designer Sunglasses',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
      price: 79.99,
      originalPrice: 129.99,
      rating: 4.6,
      sellerCount: 4,
      category: 'Fashion',
      discountPercent: 38
    },
    {
      id: 504,
      name: 'Premium Leather Belt',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
      price: 29.99,
      originalPrice: 59.99,
      rating: 4.8,
      sellerCount: 5,
      category: 'Fashion',
      discountPercent: 50
    }
  ],
  "Home": [
    {
      id: 505,
      name: 'Egyptian Cotton Bed Sheets',
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      price: 59.99,
      originalPrice: 99.99,
      rating: 4.8,
      sellerCount: 6,
      category: 'Home',
      discountPercent: 40
    },
    {
      id: 506,
      name: 'Aroma Diffuser with Essential Oils',
      imageUrl: 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6',
      price: 34.99,
      originalPrice: 49.99,
      rating: 4.6,
      sellerCount: 7,
      category: 'Home',
      discountPercent: 30
    }
  ]
};

const DealsPage = () => {
  const [activeCategory, setActiveCategory] = useState('Electronics');
  
  // Fetch real data from API
  const { data: dealsData, isLoading: dealsLoading } = useDealsProducts();
  const { data: bargainableData, isLoading: bargainableLoading } = useBargainableProducts();
  
  // Function to format time remaining
  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) return "Ends soon!";
    if (hours === 1) return "Ends in 1 hour";
    return `Ends in ${hours} hours`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Deals & Discounts</h1>
            <p className="text-gray-600 mt-2">
              Discover the best bargains, discounts, and limited-time offers on BargainBay.
            </p>
          </header>
          
          {/* Banner */}
          <div className="relative bg-gradient-to-r from-brand-700 to-brand-900 h-48 md:h-64 rounded-lg mb-8 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1607083206968-13611e3d76db)` }}
            ></div>
            <div className="relative h-full flex flex-col justify-center px-6 md:px-10">
              <Badge className="bg-yellow-500 text-white mb-2 w-fit">Limited Time</Badge>
              <h2 className="text-white text-2xl md:text-3xl font-bold">Summer Flash Sale</h2>
              <p className="text-white text-opacity-90 mt-2 max-w-lg">
                Up to 70% off on thousands of products. Deals refresh every hour!
              </p>
              <div className="mt-4">
                <Button className="bg-white text-brand-700 hover:bg-gray-100">
                  Shop All Deals
                </Button>
              </div>
            </div>
          </div>
          
          {/* Products with Active Bargains */}
          <section className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <HandCoins className="h-6 w-6 text-brand-600" />
              <h2 className="text-2xl font-bold">Products with Active Bargains</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Start a negotiation with sellers and get the best possible price on these items.
            </p>
            {bargainableLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bargainable products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(bargainableData || []).slice(0, 8).map((product: Product) => (
                  <ProductCard 
                    key={product._id} 
                    {...product}
                    isBargainable={product.allowBargaining}
                  />
                ))}
              </div>
            )}
          </section>
          
          {/* Limited-Time Discounts */}
          <section className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <Timer className="h-6 w-6 text-brand-600" />
              <h2 className="text-2xl font-bold">Limited-Time Discounts</h2>
            </div>
            <p className="text-gray-600 mb-6">
              These special prices won't last long. Get them before they expire!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {limitedTimeDeals.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    sellerCount={product.sellerCount}
                    category={product.category}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 text-white">
                      -{product.discountPercent}%
                    </Badge>
                  </div>
                  <div className="absolute bottom-16 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1.5 text-sm">
                    {formatTimeRemaining(product.endsIn)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Hot Deals (Based on Engagement) */}
          <section className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <Flame className="h-6 w-6 text-brand-600" />
              <h2 className="text-2xl font-bold">Hot Deals</h2>
            </div>
            <p className="text-gray-600 mb-6">
              The most popular items with high buyer engagement and fast acceptance rates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hotDeals.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    sellerCount={product.sellerCount}
                    category={product.category}
                  />
                  <div className="absolute bottom-16 left-0 right-0 flex justify-between bg-black bg-opacity-70 text-white px-3 py-1.5 text-sm">
                    <span>{product.offers} offers</span>
                    <span>{product.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Flash Sales */}
          <section className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <Tag className="h-6 w-6 text-brand-600" />
              <h2 className="text-2xl font-bold">Flash Sales</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Act fast! These incredible discounts are only available for a limited time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashSales.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                    sellerCount={product.sellerCount}
                    category={product.category}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white">FLASH SALE</Badge>
                  </div>
                  <div className="absolute bottom-16 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-1.5 text-sm flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {formatTimeRemaining(product.endsIn)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Deals by Category */}
          <section className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              <Percent className="h-6 w-6 text-brand-600" />
              <h2 className="text-2xl font-bold">Deals by Category</h2>
            </div>
            
            <div className="mb-6">
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="mb-6">
                  {Object.keys(categoryDeals).map((category) => (
                    <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.keys(categoryDeals).map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {categoryDeals[category as keyof typeof categoryDeals].map((product) => (
                        <div key={product.id} className="relative">
                          <ProductCard 
                            id={product.id}
                            name={product.name}
                            imageUrl={product.imageUrl}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            rating={product.rating}
                            sellerCount={product.sellerCount}
                            category={product.category}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-purple-500 text-white">
                              -{product.discountPercent}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button variant="outline" className="border-brand-500 text-brand-500">
                        View All {category} Deals
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </section>
          
          {/* Daily Recommendations */}
          <section>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Daily Deal Recommendations</CardTitle>
                <CardDescription>Personalized deals based on your browsing history</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-6 text-gray-500">
                  Sign in to see personalized deal recommendations based on your preferences!
                </p>
                <div className="flex justify-center">
                  <Link to="/login">
                    <Button className="bg-brand-500 hover:bg-brand-600">
                      Sign In to See Recommendations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DealsPage;