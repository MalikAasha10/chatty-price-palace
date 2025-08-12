import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SellerOffer from '@/components/SellerOffer';
import { Product } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isBargaining, setIsBargaining] = useState(false);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  // Cart mutation
  const addToCartMutation = useAddToCart();
  
  // Fetch product data
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    },
  });

  const product: Product | undefined = data?.product;
  
  const hasDiscount = product?.discountPercentage && product.discountPercentage > 0;

  // Add to cart function
  const addToCart = () => {
    if (!token) {
      toast({
        title: "Not logged in",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;
    
    addToCartMutation.mutate({
      productId: id,
      quantity: 1
    });
  };

  const startBargaining = () => {
    if (!token) {
      toast({
        title: "Not logged in",
        description: "Please log in to bargain with the seller",
        variant: "destructive",
      });
      return;
    }
    setIsBargaining(true);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images && product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative">
                      <img 
                        src={typeof image === 'string' ? image : (image as any).url} 
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.allowBargaining && (
                  <Badge variant="secondary">Bargaining Available</Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive">Sale {product.discountPercentage}% Off</Badge>
                )}
              </div>
            </div>

            <div className="flex items-baseline space-x-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">${product.discountedPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-500 line-through">${product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Sellers Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available from these sellers:</h3>
              <div className="space-y-3">
                <SellerOffer
                  sellerId={1}
                  sellerName={product.sellerRef?.storeName || product.sellerRef?.name || "Main Store"}
                  sellerRating={4.8}
                  sellerReviews={127}
                  initialPrice={hasDiscount ? product.discountedPrice : product.price}
                  stock={15}
                  fulfillment="BargainBay"
                  deliveryDays={2}
                  responseRate={98}
                  isPreferredSeller={true}
                  productId={id}
                  productTitle={product.title}
                  discountPercentage={product.discountPercentage || 5}
                />
                
                {/* Additional sellers for same product */}
                <SellerOffer
                  sellerId={2}
                  sellerName="Tech Hub Premium"
                  sellerRating={4.6}
                  sellerReviews={89}
                  initialPrice={(hasDiscount ? product.discountedPrice : product.price) * 1.05}
                  stock={8}
                  fulfillment="Seller"
                  deliveryDays={3}
                  responseRate={95}
                  isPreferredSeller={false}
                  productId={id}
                  productTitle={product.title}
                  discountPercentage={3}
                />
                
                <SellerOffer
                  sellerId={3}
                  sellerName="BargainBay Direct"
                  sellerRating={4.9}
                  sellerReviews={203}
                  initialPrice={(hasDiscount ? product.discountedPrice : product.price) * 0.98}
                  stock={25}
                  fulfillment="BargainBay"
                  deliveryDays={1}
                  responseRate={99}
                  isPreferredSeller={false}
                  productId={id}
                  productTitle={product.title}
                  discountPercentage={7}
                />
              </div>
            </div>

            {product.sellerRef && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Sold by: <span className="font-medium text-gray-700">{product.sellerRef.storeName || product.sellerRef.name}</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-700">Category</div>
                    <div className="col-span-2">{product.category}</div>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-700">Listed On</div>
                    <div className="col-span-2">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-700">Bargaining</div>
                    <div className="col-span-2">
                      {product.allowBargaining ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <p className="text-gray-700">
                  Standard shipping takes 3-5 business days. Express shipping options are available at checkout.
                </p>
                <p className="mt-4 text-gray-700">
                  Returns accepted within 30 days of delivery. See our return policy for more details.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
