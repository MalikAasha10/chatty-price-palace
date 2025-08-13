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

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData(response.data);
        console.log('User Data:', response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch user data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    navigate('/login');
    toast({
      title: "Logged Out", 
      description: "You have been successfully logged out"
    });
  };
  
  return { userData, loading, error, handleLogout };
};