import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  type: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      // Check for token in localStorage
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log("No authentication token found");
        navigate('/login');
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to view this page",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching user data with token");
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          console.log("User data fetched successfully:", response.data);
          setUserData(response.data.user);
          
          // For now, we'll keep using mock orders data
          // In a real app, you would fetch this from an orders API endpoint
          setRecentOrders([
            { id: '12345', date: '2023-05-01', status: 'Delivered', total: 125.99 },
            { id: '12346', date: '2023-04-22', status: 'In Transit', total: 89.99 },
          ]);
        } else {
          console.error('Failed to fetch user data:', response.data);
          setError('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching your data');
        
        // If unauthorized, redirect to login
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('token');
          navigate('/login');
          toast({
            title: "Session Expired",
            description: "Please login again",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };
  
  return { userData, loading, error, recentOrders, handleLogout };
};