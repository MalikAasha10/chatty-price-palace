// src/hooks/useSellerData.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

export const useSellerData = () => {
  const [sellerData, setSellerData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const profileRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // const ordersRes = await axios.get('http://localhost:5000/api/seller/orders/recent', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        setSellerData(profileRes.data);
        console.log('Seller Data:', profileRes.data);
        // setRecentOrders(ordersRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load seller data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return { sellerData, recentOrders, loading, error, handleLogout };
};
