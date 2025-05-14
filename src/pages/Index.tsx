import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar, TrendingUp, Zap } from 'lucide-react';

// Sample product data
const featuredProducts = [
  {
    id: 1,
    name: 'Premium Wireless Noise-Cancelling Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.8,
    sellerCount: 7,
    category: 'Electronics',
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
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Professional DSLR Camera with Dual Lens Kit',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',
    price: 1299.99,
    originalPrice: 1499.99,
    rating: 4.9,
    sellerCount: 5,
    category: 'Photography',
    bestSeller: true
  },
  {
    id: 4,
    name: 'Ergonomic Office Chair with Lumbar Support',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1',
    price: 249.99,
    originalPrice: 349.99,
    rating: 4.5,
    sellerCount: 8,
    category: 'Furniture'
  }
];

const newArrivals = [
  {
    id: 5,
    name: 'Smart Fitness Watch with Heart Rate Monitor',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.4,
    sellerCount: 6,
    category: 'Wearables'
  },
  {
    id: 6,
    name: 'Portable Bluetooth Speaker Waterproof',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1',
    price: 69.99,
    originalPrice: 99.99,
    rating: 4.3,
    sellerCount: 9,
    category: 'Audio'
  },
  {
    id: 7,
    name: 'Wireless Gaming Mouse with RGB',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.7,
    sellerCount: 11,
    category: 'Gaming'
  },
  {
    id: 8,
    name: 'Cast Iron Dutch Oven 6-Quart',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    sellerCount: 4,
    category: 'Kitchen'
  }
];

const bestDeals = [
  {
    id: 9,
    name: 'Smartphone 128GB Unlocked',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    price: 399.99,
    originalPrice: 599.99,
    rating: 4.5,
    sellerCount: 15,
    category: 'Phones'
  },
  {
    id: 10,
    name: 'Espresso Coffee Machine',
    imageUrl: 'https://images.unsplash.com/photo-1521238298504-1396a58b8151',
    price: 159.99,
    originalPrice: 259.99,
    rating: 4.6,
    sellerCount: 7,
    category: 'Appliances'
  },
  {
    id: 11,
    name: 'Robot Vacuum Cleaner with Smart Mapping',
    imageUrl: 'https://images.unsplash.com/photo-1588443173438-9019485fbb8f',
    price: 249.99,
    originalPrice: 399.99,
    rating: 4.4,
    sellerCount: 8,
    category: 'Appliances',
    bestSeller: true
  },
  {
    id: 12,
    name: 'Air Purifier with HEPA Filter',
    imageUrl: 'https://images.unsplash.com/photo-1605885948690-7f7b23901398',
    price: 119.99,
    originalPrice: 189.99,
    rating: 4.7,
    sellerCount: 6,
    category: 'Home'
  }
];

// Featured categories
// Featured categories with links to categories page
const categories = [
  { id: 1, name: 'Electronics', icon: '🔌', color: 'bg-blue-100 text-blue-800' },
  { id: 2, name: 'Fashion', icon: '👕', color: 'bg-pink-100 text-pink-800' },
  { id: 3, name: 'Home & Kitchen', icon: '🏠', color: 'bg-amber-100 text-amber-800' },
  { id: 4, name: 'Sports & Outdoors', icon: '🏀', color: 'bg-green-100 text-green-800' },
  { id: 5, name: 'Beauty', icon: '💄', color: 'bg-purple-100 text-purple-800' },
  { id: 6, name: 'Toys & Games', icon: '🎮', color: 'bg-red-100 text-red-800' }
];

// Hero banners
const heroBanners = [
  { 
    id: 1,
    title: "Real-time Bargaining",
    subtitle: "Negotiate directly with multiple sellers",
    description: "Get the best price by bargaining in real-time with sellers. Compare offers and save big!",
    ctaText: "Start Bargaining Now",
    ctaLink: "/categories",
    bgImage: "https://images.unsplash.com/photo-1556742031-c6961e8560b0",
    bgColor: "from-brand-700 to-brand-900"
  },
  { 
    id: 2,
    title: "Summer Sale",
    subtitle: "Up to 70% off",
    description: "Massive discounts on top products from multiple sellers. Limited time only!",
    ctaText: "Shop the Sale",
    ctaLink: "/deals",
    bgImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
    bgColor: "from-amber-700 to-amber-900"
  }
];

const Index = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const currentBanner = heroBanners[currentBannerIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % heroBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative">
          <div 
            className={`relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r ${currentBanner.bgColor}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000"
              style={{ backgroundImage: `url(${currentBanner.bgImage})` }}
            ></div>

            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-xl text-white space-y-6 animate-slide-up">
                <div>
                  <h2 className="text-lg md:text-xl font-medium">{currentBanner.subtitle}</h2>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2">{currentBanner.title}</h1>
                </div>
                <p className="text-lg opacity-90">{currentBanner.description}</p>
                <div>
                  <Link to={currentBanner.ctaLink}>
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      {currentBanner.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Dots for hero banner */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentBannerIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  to={`/categories`}
                  state={{ selectedCategory: category.name }}
                  className="flex flex-col items-center p-4 rounded-lg transition-all hover:shadow-md"
                >
                  <div className={`text-4xl p-4 rounded-full mb-3 ${category.color}`}>
                    {category.icon}
                  </div>
                  <span className="font-medium text-gray-800">{category.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/categories">
                <Button variant="outline">
                  View All Categories <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How BargainBay Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-12">
              Enjoy a unique shopping experience where you can negotiate prices directly with sellers in real-time.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6">
                <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Find Products</h3>
                <p className="text-gray-600">Browse multiple sellers offering the same product with different prices.</p>
              </div>

              <div className="flex flex-col items-center p-6">
                <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Bargain in Real-time</h3>
                <p className="text-gray-600">Negotiate directly with sellers through our real-time chat system.</p>
              </div>

              <div className="flex flex-col items-center p-6">
                <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Get the Best Deal</h3>
                <p className="text-gray-600">Compare offers, accept the best price, and complete your purchase.</p>
              </div>
            </div>

            <div className="mt-10">
              <Button className="bg-brand-500 hover:bg-brand-600">
                Learn More About BargainBay
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-brand-600 font-medium flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="new">New Arrivals</TabsTrigger>
                <TabsTrigger value="deals">Best Deals</TabsTrigger>
              </TabsList>

              <TabsContent value="featured">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="new">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {newArrivals.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deals">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bestDeals.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-brand-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Bargaining?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of smart shoppers who are saving money through real-time price negotiation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-brand-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;