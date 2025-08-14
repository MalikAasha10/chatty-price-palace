
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, ShoppingBag, Settings, Key } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserData } from '@/hooks/useUserData';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  type: string;
  storeName?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const UserProfile = () => {
  const { userData, loading, error, handleLogout } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    storeName: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (userData) {
      fetchProfileData();
      fetchOrders();
    }
  }, [userData]);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !userData?._id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/users/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfileData(response.data.data);
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email,
          storeName: response.data.data.storeName || ''
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !userData?._id) return;

    try {
      setOrderLoading(true);
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform the real order data to match the interface
      const transformedOrders = response.data.map((order: any) => ({
        id: order._id,
        date: new Date(order.createdAt).toLocaleDateString(),
        status: order.status,
        total: order.totalAmount,
        items: order.items.map((item: any) => ({
          id: item._id,
          name: item.productId?.title || 'Unknown Product',
          price: item.finalPrice,
          quantity: item.quantity
        }))
      }));

      setOrders(transformedOrders);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      });
      console.error("Error fetching orders:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !userData?._id) return;

    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/users/${userData._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfileData(response.data.data);
        setIsEditMode(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token || !userData?._id) return;

    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/users/${userData._id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast({
          title: "Success",
          description: "Password changed successfully"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.message 
          ? err.response.data.message 
          : "Failed to change password",
        variant: "destructive"
      });
      console.error("Error changing password:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    if (profileData) {
      setFormData({
        name: profileData.name,
        email: profileData.email,
        storeName: profileData.storeName || ''
      });
    }
    setIsEditMode(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-xl">Loading profile data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
            <p className="mb-4">{error || "You must be logged in to view this page"}</p>
            <Button asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="bg-brand-100 text-brand-600 text-xl">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-xl">{formData.name}</h2>
              <p className="text-gray-500 text-sm">{formData.email}</p>
            </div>
            
            <nav className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/user-dashboard')}
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-100"
                onClick={() => navigate('/user-profile')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/orders')}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <Key className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </Card>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="account">
              <TabsList className="mb-6">
                <TabsTrigger value="account">Account Settings</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            value={formData.name} 
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email"
                            value={formData.email} 
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                          />
                        </div>
                        
                        {userData.type === 'seller' && (
                          <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input 
                              id="storeName" 
                              name="storeName"
                              value={formData.storeName} 
                              onChange={handleInputChange}
                              disabled={!isEditMode}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {isEditMode ? (
                      <>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">Change Password</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Your Password</DialogTitle>
                              <DialogDescription>
                                Enter your current password and set a new password.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input 
                                  id="currentPassword" 
                                  name="currentPassword"
                                  type="password" 
                                  value={passwordData.currentPassword}
                                  onChange={handlePasswordChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input 
                                  id="newPassword" 
                                  name="newPassword"
                                  type="password" 
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input 
                                  id="confirmPassword" 
                                  name="confirmPassword"
                                  type="password" 
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleChangePassword} disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Password'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button onClick={() => setIsEditMode(true)}>
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View all your past orders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orderLoading ? (
                      <div className="text-center py-4">Loading orders...</div>
                    ) : orders.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.id}</TableCell>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/orders/${order.id}`}>View Details</a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">You haven't placed any orders yet.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
