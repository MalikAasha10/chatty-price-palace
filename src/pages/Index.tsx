import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ArrowRight, Calendar, TrendingUp, Zap } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';

// Featured categories
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

// No fake data - only use real products from API

const Index = () => {
  const navigate = useNavigate();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  // Fetch featured products from API
  const { data: productsData, isLoading } = useFeaturedProducts();
  
  // Create carousel items from products and their images
  const createCarouselItems = (products: any[]) => {
    const items: Array<{id: string, productId: string, imageUrl: string, productTitle: string}> = [];
    products?.forEach((product) => {
      if (Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach((image: any, index: number) => {
          const imageUrl = typeof image === 'string' ? image : image.url;
          items.push({
            id: `${product._id}-${index}`,
            productId: product._id,
            imageUrl,
            productTitle: product.title
          });
        });
      } else {
        items.push({
          id: product._id,
          productId: product._id,
          imageUrl: 'https://placehold.co/400',
          productTitle: product.title
        });
      }
    });
    return items;
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 1500);

    return () => clearInterval(interval);
  }, [carouselApi]);

  // Convert API product data to format expected by ProductCard
  const mapProductToCardProps = (product: any) => ({
    id: product._id,
    name: product.title,
    imageUrl: Array.isArray(product.images) && product.images.length > 0 
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) 
      : 'https://placehold.co/400',
    price: product.discountPercentage > 0 ? product.discountedPrice : product.price,
    originalPrice: product.discountPercentage > 0 ? product.price : undefined,
    rating: 4.5, // Default rating since we don't have real ratings yet
    sellerCount: 1, // Default to 1 seller per product for now
    category: product.category,
    bestSeller: false,
    isBargainable: product.allowBargaining
  });

  // Use real data from API - no fallback to fake data
  const featuredProducts = productsData?.featuredProducts?.map(mapProductToCardProps) || [];
  const newArrivals = productsData?.featuredProducts?.map(mapProductToCardProps) || [];
  const bestDeals = productsData?.dealsProducts?.map(mapProductToCardProps) || [];
  
  // Create carousel items from featured products
  const carouselItems = createCarouselItems(productsData?.featuredProducts || []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Product Carousel */}
        <section className="relative bg-gradient-to-r from-brand-700 to-brand-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center text-white mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Discover Amazing Products
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                Negotiate prices directly with sellers and get the best deals on quality products
              </p>
            </div>

            {/* Product Carousel */}
            <div className="relative max-w-6xl mx-auto">
              {isLoading ? (
                <div className="animate-pulse bg-white/10 rounded-lg h-96"></div>
              ) : carouselItems.length > 0 ? (
                <Carousel
                  setApi={setCarouselApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent>
                    {carouselItems.map((item) => (
                      <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                        <div 
                          className="p-1 cursor-pointer"
                          onClick={() => navigate(`/product/${item.productId}`)}
                        >
                          <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.productTitle}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              />
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="text-white border-white hover:bg-white hover:text-brand-600" />
                  <CarouselNext className="text-white border-white hover:bg-white hover:text-brand-600" />
                </Carousel>
              ) : (
                <div className="text-center text-white py-12">
                  <p className="text-lg opacity-90">No featured products available at the moment.</p>
                </div>
              )}
            </div>

            <div className="text-center mt-8">
              <Link to="/categories">
                <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100">
                  Browse All Products
                </Button>
              </Link>
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
                  to={`/categories?category=${encodeURIComponent(category.name)}`}
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
                  {isLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : featuredProducts.length > 0 ? (
                    featuredProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No featured products available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {isLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : newArrivals.length > 0 ? (
                    newArrivals.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No new arrivals available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deals">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {isLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : bestDeals.length > 0 ? (
                    bestDeals.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No deals available at the moment.</p>
                    </div>
                  )}
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
                <Button size="lg" variant="outline" className="border-white text-brand-600 hover:bg-brand-700">
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
