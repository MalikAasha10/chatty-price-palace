import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, MapPin, User, Package, Smartphone, Banknote, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart, useClearCart } from '@/hooks/useCart';
import axios from 'axios';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const clearCart = useClearCart();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    phone: '',
    email: ''
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash_on_delivery' | 'jazzcash' | 'easypaisa'>('cash_on_delivery');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    transactionId: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate totals
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.bargainedPrice || item.productId.discountedPrice || item.productId.price;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over Rs. 5000
  const tax = subtotal * 0.17; // 17% GST in Pakistan
  const total = subtotal + shipping + tax;

  // Simulate payment processing for JazzCash/EasyPaisa
  const simulatePayment = async (method: string, phoneNumber: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fake transaction ID
    const transactionId = `${method.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      status: 'completed'
    };
  };
  
  const handlePlaceOrder = async () => {
    // Basic validation
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone || !shippingAddress.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details",
        variant: "destructive"
      });
      return;
    }

    if (selectedPaymentMethod !== 'cash_on_delivery' && !paymentDetails.phoneNumber) {
      toast({
        title: "Missing Payment Information",
        description: "Please enter your phone number for mobile payment",
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

      let paymentStatus = 'pending';
      let transactionId = null;

      // Handle payment processing
      if (selectedPaymentMethod !== 'cash_on_delivery') {
        try {
          const paymentResult = await simulatePayment(selectedPaymentMethod, paymentDetails.phoneNumber);
          paymentStatus = 'completed';
          transactionId = paymentResult.transactionId;
          
          toast({
            title: "Payment Successful",
            description: `Transaction ID: ${transactionId}`,
          });
        } catch (error) {
          toast({
            title: "Payment Failed",
            description: "Payment processing failed. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }

      // Prepare order data
      const orderData = {
        cartItems: items.map(item => ({
          productId: item.productId._id,
          name: item.productId.title,
          quantity: item.quantity,
          price: item.bargainedPrice || item.productId.discountedPrice || item.productId.price,
          bargainId: item.bargainedPrice ? item._id : null
        })),
        shippingDetails: {
          fullName: shippingAddress.fullName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          email: shippingAddress.email
        },
        paymentMethod: selectedPaymentMethod,
        paymentStatus,
        transactionId
      };

      // Send order to backend
      const response = await axios.post('/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      
      // Clear cart after successful order
      await clearCart.mutateAsync();
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your order total is Rs. ${total.toFixed(2)}. Order ID: ${data.order._id}`,
      });
      
      // Navigate to success page
      navigate('/user-dashboard', { 
        state: { 
          orderSuccess: true, 
          orderTotal: total.toFixed(2),
          orderId: data.order._id,
          paymentMethod: selectedPaymentMethod,
          transactionId
        }
      });
      
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.response?.data?.message || "There was an error processing your order",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold">Loading your cart...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || !items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold">No Items to Checkout</h2>
            <p className="mt-2 text-muted-foreground">Your cart is empty. Add some items before checkout.</p>
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
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Secure Checkout</h1>
        </div>
        
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
                    placeholder="Muhammad Ali"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="House # 123, Street 45, F-8 Markaz"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Islamabad"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">Province *</Label>
                  <Select onValueChange={(value) => setShippingAddress(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="punjab">Punjab</SelectItem>
                      <SelectItem value="sindh">Sindh</SelectItem>
                      <SelectItem value="kpk">Khyber Pakhtunkhwa</SelectItem>
                      <SelectItem value="balochistan">Balochistan</SelectItem>
                      <SelectItem value="islamabad">Islamabad Capital Territory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="44000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
            </Card>
            
            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <RadioGroup value={selectedPaymentMethod} onValueChange={(value: any) => setSelectedPaymentMethod(value)}>
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="cash_on_delivery" id="cash" />
                    <div className="flex items-center space-x-3 flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <Label htmlFor="cash" className="font-medium">Cash on Delivery</Label>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>

                  {/* JazzCash */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="jazzcash" id="jazzcash" />
                    <div className="flex items-center space-x-3 flex-1">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <div>
                        <Label htmlFor="jazzcash" className="font-medium">JazzCash</Label>
                        <p className="text-sm text-muted-foreground">Mobile payment via JazzCash</p>
                      </div>
                    </div>
                  </div>

                  {/* EasyPaisa */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="easypaisa" id="easypaisa" />
                    <div className="flex items-center space-x-3 flex-1">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <Label htmlFor="easypaisa" className="font-medium">EasyPaisa</Label>
                        <p className="text-sm text-muted-foreground">Mobile payment via EasyPaisa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              {/* Mobile Payment Details */}
              {selectedPaymentMethod !== 'cash_on_delivery' && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="phoneNumber">Mobile Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={paymentDetails.phoneNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You will receive payment instructions on this number
                  </p>
                </div>
              )}
            </Card>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item, index) => {
                  const price = item.bargainedPrice || item.productId.discountedPrice || item.productId.price;
                  const originalPrice = item.productId.price;
                  const image = Array.isArray(item.productId.images) 
                    ? (typeof item.productId.images[0] === 'string' ? item.productId.images[0] : item.productId.images[0]?.url)
                    : '/placeholder.svg';
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <img 
                        src={image} 
                        alt={item.productId.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <h3 className="font-medium line-clamp-2">{item.productId.title}</h3>
                        <p className="text-sm text-muted-foreground">Seller: {item.productId.sellerRef.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          {item.bargainedPrice && item.bargainedPrice < originalPrice ? (
                            <>
                              <span className="font-semibold text-green-600">
                                Rs. {item.bargainedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                Rs. {originalPrice.toFixed(2)}
                              </span>
                              <Badge variant="secondary" className="text-xs">Bargained</Badge>
                            </>
                          ) : (
                            <span className="font-semibold">Rs. {price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator className="my-4" />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (17%)</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                
                {subtotal >= 5000 && (
                  <p className="text-sm text-green-600 text-center">🎉 You qualify for free shipping!</p>
                )}
              </div>
              
              <Button 
                onClick={handlePlaceOrder}
                className="w-full mt-6"
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedPaymentMethod === 'cash_on_delivery' ? 'Placing Order...' : 'Processing Payment...'}
                  </>
                ) : (
                  `Place Order - Rs. ${total.toFixed(2)}`
                )}
              </Button>
              
              <div className="text-xs text-center text-muted-foreground mt-3 space-y-1">
                <p>🔒 Your information is secure and encrypted</p>
                {selectedPaymentMethod === 'cash_on_delivery' && (
                  <p>💰 Pay cash when your order arrives</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;