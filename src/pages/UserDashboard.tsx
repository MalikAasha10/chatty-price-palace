import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Heart, Clock, Settings, LogOut } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { format } from 'date-fns';

const UserDashboard = () => {
  const { userData, loading, error, recentOrders, handleLogout } = useUserData();

  // Format the date if we have userData
  const formatJoinDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch (e) {
      return 'Unknown';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-xl">Loading your dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
            <p className="mb-4">{error}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <Card className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-brand-600" />
                </div>
                <h2 className="font-bold text-xl">{userData?.name || 'User'}</h2>
                <p className="text-gray-500 text-sm">{userData?.email || 'user@example.com'}</p>
              </div>
              
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/user-dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Orders
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/history">
                    <Clock className="mr-2 h-4 w-4" />
                    Browse History
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-6">
                <h2 className="text-lg font-semibold mb-2">Welcome back, {userData?.name?.split(' ')[0] || 'User'}!</h2>
                <p>You've been a member since {userData ? formatJoinDate(userData.createdAt) : 'Unknown'}.</p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-2">Your Recent Activity</h2>
                <p className="text-gray-600">You've placed {recentOrders.length} orders in the past month.</p>
                <Button className="mt-4 bg-brand-500 hover:bg-brand-600" asChild>
                  <Link to="/catalog">Continue Shopping</Link>
                </Button>
              </Card>
            </div>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">Order ID</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="px-4 py-2">{order.id}</td>
                          <td className="px-4 py-2">{order.date}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/orders/${order.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              )}
              
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/orders">View All Orders</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;