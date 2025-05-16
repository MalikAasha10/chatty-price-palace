
// src/pages/SellerDashboard.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Package, BarChart, Tag, LogOut, MessageSquare } from 'lucide-react';
import { useSellerData } from "@/hooks/useSellerData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  const { sellerData, recentOrders, loading, error, handleLogout } = useSellerData();

  const user = sellerData?.user;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading seller dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const firstName = user?.name?.split(" ")[0] || "Seller";

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
                <h2 className="font-bold text-xl">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                <Link to="/seller-products">
                  <Button variant="ghost" className="w-full justify-start">
                    <Tag className="mr-2 h-4 w-4" />
                    Products
                  </Button>
                </Link>
                <Link to="/seller-chats">
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Customer Chats
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Welcome back, {firstName}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Total Sales</h3>
                <p className="text-2xl font-bold">${sellerData?.stats?.sales?.toLocaleString() || 0}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Total Orders</h3>
                <p className="text-2xl font-bold">{sellerData?.stats?.orders || 0}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Products</h3>
                <p className="text-2xl font-bold">{sellerData?.stats?.products || 0}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Pending Orders</h3>
                <p className="text-2xl font-bold">{sellerData?.stats?.pendingOrders || 0}</p>
              </Card>
            </div>

            {/* Recent Orders Table */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Recent Orders</h3>
                <Link to="/seller-chats">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Customer Chats
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Order ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Customer</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                          No recent orders
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="px-4 py-2">{order.id}</td>
                          <td className="px-4 py-2">{order.customer}</td>
                          <td className="px-4 py-2">{order.product}</td>
                          <td className="px-4 py-2">${order.amount}</td>
                          <td className="px-4 py-2">{order.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
