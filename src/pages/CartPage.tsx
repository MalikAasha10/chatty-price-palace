import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/hooks/useCart';

const CartPage: React.FC = () => {
  const { data: cartData, isLoading, error } = useCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !cartData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center">
            <p className="text-lg text-red-500">Error loading cart. Please try again.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isEmpty = !cartData.items || cartData.items.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {!isEmpty && (
            <Button 
              variant="outline" 
              onClick={clearCart}
              disabled={clearCartMutation.isPending}
            >
              Clear Cart
            </Button>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to your cart to get started!</p>
            <Button asChild>
              <Link to="/categories">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.items.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            typeof item.productId.images[0] === 'string' 
                              ? item.productId.images[0] 
                              : (item.productId.images[0] as any)?.url
                          }
                          alt={item.productId.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <Link 
                          to={`/product/${item.productId._id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {item.productId.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Sold by: {item.productId.sellerRef.storeName || item.productId.sellerRef.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold">
                            ${(item.productId.discountedPrice || item.productId.price).toFixed(2)}
                          </span>
                          {item.productId.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.productId.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateCartMutation.isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updateCartMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item._id)}
                          disabled={removeFromCartMutation.isPending}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartData.items.length} items)</span>
                    <span>${cartData.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${cartData.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <Button className="w-full mt-6" size="lg">
                    Proceed to Checkout
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/categories">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;