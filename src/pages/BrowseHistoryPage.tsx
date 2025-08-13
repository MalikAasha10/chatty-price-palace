import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { History, ShoppingBag, ExternalLink } from 'lucide-react';

interface HistoryItem {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  viewedAt: string;
}

const BrowseHistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user data from API
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userId = userResponse.data._id;
        const response = await axios.get(`/api/history/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const historyData = response.data.data || [];
        const formattedHistory = historyData.map((item: any) => ({
          _id: item._id,
          productId: item.productId._id,
          productName: item.productId.name,
          productImage: item.productId.image,
          viewedAt: item.viewedAt
        }));
        
        setHistory(formattedHistory);

      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch browse history');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-xl">Loading your browse history...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading History</h2>
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Browse History</h1>
        </div>

        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No browsing history yet</h2>
            <p className="text-muted-foreground mb-4">
              Start browsing products to see your history here!
            </p>
            <Button asChild>
              <Link to="/categories">Browse Products</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img
                    src={item.productImage || '/placeholder.svg'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Viewed {format(new Date(item.viewedAt), 'MMM dd, yyyy')}
                  </p>
                  <Button asChild className="w-full">
                    <Link to={`/product/${item.productId}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Product
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BrowseHistoryPage;