
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SellerOffer from '@/components/SellerOffer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Star, ChevronRight, Heart, Share, TrendingUp, Award, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: number;
  url: string;
}

interface ProductReview {
  id: number;
  username: string;
  rating: number;
  date: string;
  comment: string;
}

interface SellerData {
  sellerId: number;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  initialPrice: number;
  stock: number;
  fulfillment: 'Seller' | 'BargainBay';
  deliveryDays: number;
  responseRate: number;
  isPreferredSeller?: boolean;
}

// Sample product data
const productData = {
  id: 1,
  name: 'Premium Wireless Noise-Cancelling Headphones',
  brand: 'AudioTech',
  description: `Experience premium sound quality with these wireless noise-cancelling headphones. 
  Features include 30-hour battery life, comfortable over-ear design, and advanced noise-cancelling 
  technology. Compatible with all Bluetooth devices and comes with a carrying case.`,
  
  features: [
    'Active Noise Cancellation Technology',
    '30-hour Battery Life',
    'Premium Sound Quality with Deep Bass',
    'Comfortable Over-Ear Design',
    'Quick Charge: 5 mins for 3 hours playback',
    'Voice Assistant Compatible',
    'Foldable Design with Carrying Case'
  ],
  
  specifications: {
    'Brand': 'AudioTech',
    'Model': 'AT-NC800',
    'Color': 'Matte Black',
    'Connectivity': 'Bluetooth 5.0, 3.5mm Jack',
    'Battery': 'Lithium-ion, 30 hours',
    'Weight': '250g',
    'Warranty': '2 Years Manufacturer Warranty'
  },
  
  images: [
    { id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
    { id: 2, url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b' },
    { id: 3, url: 'https://images.unsplash.com/photo-1563330232-57114bb0823c' },
    { id: 4, url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1' }
  ],
  
  rating: 4.7,
  reviewCount: 387,
  
  reviews: [
    { id: 1, username: 'AudioFan452', rating: 5, date: '2023-12-10', comment: 'Best headphones I\'ve ever purchased! The noise cancellation is outstanding and the battery life is incredible.' },
    { id: 2, username: 'MusicLover', rating: 4, date: '2023-11-28', comment: 'Great sound quality and comfortable for long listening sessions. The only downside is they\'re a bit bulky for travel.' },
    { id: 3, username: 'TechReviewer', rating: 5, date: '2023-11-15', comment: 'Premium build quality and excellent sound. The noise cancellation works perfectly even in noisy environments.' }
  ],
  
  category: 'Electronics',
  subcategory: 'Headphones & Earbuds',
  
  sellers: [
    { 
      sellerId: 101, 
      sellerName: 'ElectronicsPro', 
      sellerRating: 4.8, 
      sellerReviews: 1245,
      initialPrice: 249.99, 
      stock: 15, 
      fulfillment: 'BargainBay', 
      deliveryDays: 2, 
      responseRate: 98,
      isPreferredSeller: true
    },
    { 
      sellerId: 102, 
      sellerName: 'AudioGadgets', 
      sellerRating: 4.6, 
      sellerReviews: 873,
      initialPrice: 269.99, 
      stock: 8, 
      fulfillment: 'Seller', 
      deliveryDays: 3, 
      responseRate: 95
    },
    { 
      sellerId: 103, 
      sellerName: 'TechDeals', 
      sellerRating: 4.3, 
      sellerReviews: 521,
      initialPrice: 239.99, 
      stock: 5, 
      fulfillment: 'Seller', 
      deliveryDays: 4, 
      responseRate: 90
    }
  ],
  
  relatedProducts: [
    { id: 5, name: 'Wireless Earbuds with Charging Case', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb' },
    { id: 6, name: 'Bluetooth Speaker Waterproof', price: 69.99, imageUrl: 'https://images.unsplash.com/photo-1589003077984-894e762f8741' },
    { id: 7, name: 'Audio Interface for Home Studio', price: 149.99, imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04' }
  ]
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeImageId, setActiveImageId] = useState<number>(productData.images[0]?.id);
  const [isWishlist, setIsWishlist] = useState(false);
  
  // Get the active image URL
  const activeImage = productData.images.find(img => img.id === activeImageId);
  
  // Toggle wishlist
  const toggleWishlist = () => {
    setIsWishlist(!isWishlist);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to="/categories" className="hover:text-brand-600">{productData.category}</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to={`/categories/${productData.subcategory}`} className="hover:text-brand-600">{productData.subcategory}</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium truncate">{productData.name}</span>
          </nav>
          
          {/* Product Overview Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  <img 
                    src={activeImage?.url || productData.images[0]?.url}
                    alt={productData.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {productData.images.map(image => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageId(image.id)}
                      className={cn(
                        "border-2 rounded-md overflow-hidden aspect-square",
                        activeImageId === image.id ? "border-brand-500" : "border-gray-200"
                      )}
                    >
                      <img 
                        src={image.url}
                        alt={`${productData.name} view ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Product Details */}
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-200">{productData.category}</Badge>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleWishlist}
                        className={isWishlist ? "text-red-500" : "text-gray-400"}
                      >
                        <Heart className={cn("h-5 w-5", isWishlist && "fill-current")} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mt-2">{productData.name}</h1>
                  <div className="text-sm text-gray-500 mt-1">By {productData.brand}</div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium ml-1">{productData.rating.toFixed(1)}</span>
                  </div>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">{productData.reviewCount} reviews</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-brand-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {productData.sellers.length} sellers available
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-semibold text-blue-800">Bargaining Available</h3>
                      <p className="text-sm text-blue-700">
                        This product supports real-time price negotiation. Start a chat with any seller to bargain and get the best price!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{productData.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    {productData.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-500 mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-1 mb-4 text-green-700">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">All sellers offer money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seller Offers Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Compare Seller Offers</h2>
              
              <div className="space-y-4">
                {productData.sellers.map((seller) => (
                  <SellerOffer key={seller.sellerId} {...seller} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <Tabs defaultValue="specifications">
                <TabsList className="mb-6">
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({productData.reviews.length})</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specifications" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(productData.specifications).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium text-gray-700 w-24">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold ml-2">{productData.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Based on {productData.reviewCount} reviews
                    </div>
                  </div>
                  
                  {productData.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0">
                      <div className="flex justify-between mb-2">
                        <div>
                          <span className="font-medium">{review.username}</span>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">Show All Reviews</Button>
                </TabsContent>
                
                <TabsContent value="shipping" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                      <p className="text-gray-700">
                        Shipping times vary by seller. Typically, items are shipped within 1-2 business days.
                        Delivery times are displayed on each seller's offer card.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Return Policy</h3>
                      <p className="text-gray-700">
                        All products can be returned within 30 days of delivery for a full refund.
                        Products must be in original packaging and unused condition.
                        Return shipping fees may apply based on the seller's policy.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">BargainBay Guarantee</h3>
                      <p className="text-gray-700">
                        All purchases are protected by our BargainBay Guarantee.
                        If your item doesn't arrive or isn't as described, we'll help you get a refund.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Related Products */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">You May Also Like</h2>
                <Link to="/related" className="text-brand-600 font-medium flex items-center">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productData.relatedProducts.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 line-clamp-2 h-12">{product.name}</h3>
                        <div className="text-lg font-semibold text-brand-600 mt-2">${product.price.toFixed(2)}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductPage;
