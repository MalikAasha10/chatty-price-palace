import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, MapPin, User, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CheckoutItem {
  productId: string;
  title: string;
  price: number;
  negotiatedPrice?: number;
  quantity: number;
  image: string;
  seller: string;
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get items from state or URL params (for bargaining redirects)
  const { items: stateItems = [] } = location.state || {};
  const urlParams = new URLSearchParams(location.search);
  const urlItems = urlParams.get('items');
  
  let items: CheckoutItem[] = stateItems;
  if (urlItems && !stateItems.length) {
    try {
      items = JSON.parse(decodeURIComponent(urlItems));
    } catch (error) {
      console.error('Error parsing URL items:', error);
    }
  }
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for bargain item in localStorage
  React.useEffect(() => {
    const bargainItem = localStorage.getItem('bargainItem');
    if (bargainItem && !items.length) {
      try {
        const parsedItem = JSON.parse(bargainItem);
        items = [parsedItem];
      } catch (error) {
        console.error('Error parsing bargain item:', error);
      }
    }
  }, []);
  
  // Calculate totals
  const subtotal = items.reduce((sum: number, item: CheckoutItem) => 
    sum + (item.negotiatedPrice || item.price) * item.quantity, 0
  );
  const shipping = 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  const handlePlaceOrder = async () => {
    // Basic validation
    if (!shippingAddress.fullName || !shippingAddress.address || !paymentMethod.cardNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place an order",
          variant: "destructive"
        });
        return;
      }

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          bargainId: item.negotiatedPrice ? 'auto-generated' : null // This should be actual bargain ID
        })),
        shippingAddress,
        paymentMethod: 'credit_card'
      };

      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      // Clear bargain item from localStorage
      localStorage.removeItem('bargainItem');
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order total is $${total.toFixed(2)}. Order ID: ${data.order._id}`,
        variant: "default"
      });
      
      // Navigate to success page
      navigate('/user-dashboard', { 
        state: { 
          orderSuccess: true, 
          orderTotal: total.toFixed(2),
          orderId: data.order._id
        }
      });
      
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No Items to Checkout</h2>
            <p className="mt-2 text-gray-600">Your checkout session has expired or no items were selected.</p>
            <Button asChild className="mt-6">
              <a href="/cart">Go to Cart</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="10001"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>
            </Card>
            
            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    value={paymentMethod.cardholderName}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={paymentMethod.cardNumber}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={paymentMethod.expiryDate}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={paymentMethod.cvv}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item: CheckoutItem, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-500">Seller: {item.seller}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {item.negotiatedPrice && item.negotiatedPrice < item.price ? (
                          <>
                            <span className="font-semibold text-green-600">
                              ${item.negotiatedPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="text-xs">Negotiated</Badge>
                          </>
                        ) : (
                          <span className="font-semibold">${item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-primary hover:bg-primary/90"
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  `Complete Purchase - $${total.toFixed(2)}`
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                🔒 Your payment information is secure and encrypted
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;