import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag, CreditCard, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  sellerId: number;
  sellerName: string;
  inStock: boolean;
}

const sampleCartItems: CartItem[] = [
  {
    id: 1,
    productId: 1,
    name: 'Premium Wireless Noise-Cancelling Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    price: 199.99,
    originalPrice: 299.99,
    quantity: 1,
    sellerId: 101,
    sellerName: 'ElectronicsPro',
    inStock: true
  },
  {
    id: 2,
    productId: 5,
    name: 'Smart Fitness Watch with Heart Rate Monitor',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    price: 129.99,
    originalPrice: null,
    quantity: 2,
    sellerId: 103,
    sellerName: 'TechDeals',
    inStock: true
  }
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(sampleCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateSavings = () => {
    return cartItems.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal();
  };
  
  const handleQuantityChange = (id: number, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  const handleRemoveItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };
  
  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setIsApplyingCoupon(true);
    
    setTimeout(() => {
      setIsApplyingCoupon(false);
      
      if (couponCode.toUpperCase() === 'DISCOUNT20') {
        toast.success('Coupon applied successfully!');
      } else {
        toast.error('Invalid coupon code');
      }
    }, 1500);
  };
  
  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const total = calculateTotal();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Shopping Cart</h1>
          
          <nav className="flex text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white mb-6 overflow-hidden">
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-32 h-32 mb-4 md:mb-0 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          
                          <div className="flex-grow md:ml-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <Link to={`/product/${item.productId}`} className="text-lg font-medium hover:text-brand-600 transition-colors">
                                  {item.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">Sold by: {item.sellerName}</p>
                                <p className="text-sm text-green-600 mt-1">In Stock</p>
                              </div>
                              
                              <div className="mt-3 md:mt-0">
                                <div className="flex items-center justify-end">
                                  <span className="text-lg font-semibold text-gray-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ${(item.originalPrice * item.quantity).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border rounded-md">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {index < cartItems.length - 1 && <Separator />}
                    </div>
                  ))}
                </Card>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-brand-500 text-brand-600"
                    asChild
                  >
                    <Link to="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="bg-white overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      {savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Savings</span>
                          <span>-${savings.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-medium mb-2">Apply Coupon Code</p>
                      <div className="flex">
                        <Input 
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button 
                          className="rounded-l-none bg-brand-500 hover:bg-brand-600" 
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon}
                        >
                          {isApplyingCoupon ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-brand-500 hover:bg-brand-600 text-base py-6">
                      <Lock className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                    
                    <div className="mt-6 flex flex-col space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        <span>Free returns within 30 days</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span>We accept major credit cards</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-white p-8 text-center">
              <div className="mb-6">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Button className="bg-brand-500 hover:bg-brand-600" asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;
