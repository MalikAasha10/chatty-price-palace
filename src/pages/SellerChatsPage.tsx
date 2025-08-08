
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SellerChatsList, { ChatItem } from '@/components/seller/SellerChatsList';
import SellerChatBox from '@/components/seller/SellerChatBox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { io, Socket } from 'socket.io-client';
import { MessageType } from '@/components/bargaining/MessageList';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';

const SellerChatsPage = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatDetails, setSelectedChatDetails] = useState<{
    buyerName: string;
    productName: string;
    initialPrice: number;
    currentPrice: number;
    messages: MessageType[];
    status: 'active' | 'accepted' | 'rejected' | 'expired';
  } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view your chats",
        variant: "destructive"
      });
      return;
    }

    const socketInstance = io(undefined, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      fetchSellerBargains();
    });

    socketInstance.on('new_message', (data) => {
      // Update chat list with new message
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === data.bargainId
            ? {
                ...chat,
                lastMessage: data.message.text,
                lastMessageTime: new Date(data.message.timestamp),
                unreadCount: chat._id !== selectedChatId ? chat.unreadCount + 1 : 0,
                currentPrice: data.message.isOffer ? data.message.offerAmount : chat.currentPrice
              }
            : chat
        )
      );

      // Update current chat if selected
      if (data.bargainId === selectedChatId) {
        const newMessage = {
          text: data.message.text,
          sender: data.message.sender,
          timestamp: new Date(data.message.timestamp),
          isOffer: data.message.isOffer,
          offerAmount: data.message.offerAmount
        };

        setSelectedChatDetails(prev => 
          prev ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            currentPrice: data.message.isOffer && data.message.offerAmount ? data.message.offerAmount : prev.currentPrice
          } : null
        );
      }
    });

    socketInstance.on('status_updated', (data) => {
      // Update chat status
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === data.bargainId ? { ...chat, status: data.status } : chat
        )
      );

      // Update current chat if selected
      if (data.bargainId === selectedChatId) {
        setSelectedChatDetails(prev => 
          prev ? { ...prev, status: data.status } : null
        );
      }
    });

    socketInstance.on('error', (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [selectedChatId, toast]);

  // Fetch all seller bargaining chats
  const fetchSellerBargains = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bargain/seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const formattedChats: ChatItem[] = response.data.bargains.map((bargain: any) => ({
          _id: bargain._id,
          buyerName: bargain.buyerId.name,
          productName: bargain.productId.title,
          productId: bargain.productId._id,
          lastMessage: bargain.messages[bargain.messages.length - 1]?.text || 'No messages yet',
          lastMessageTime: new Date(bargain.updatedAt),
          unreadCount: 0, // This would need to be calculated server-side
          status: bargain.status,
          currentPrice: bargain.currentPrice
        }));
        
        setChats(formattedChats);
        
        // Select first chat if available and none selected
        if (formattedChats.length > 0 && !selectedChatId) {
          handleChatSelect(formattedChats[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching bargains:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chatId: string) => {
    try {
      setSelectedChatId(chatId);
      
      // Reset unread count
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
      
      // Fetch detailed chat data
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bargain/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const bargain = response.data.bargain;
        
        // Format messages
        const formattedMessages = bargain.messages.map((msg: any) => ({
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
          isOffer: msg.isOffer || false,
          offerAmount: msg.offerAmount
        }));
        
        setSelectedChatDetails({
          buyerName: bargain.buyerId.name,
          productName: bargain.productId.title,
          initialPrice: bargain.initialPrice,
          currentPrice: bargain.currentPrice,
          messages: formattedMessages,
          status: bargain.status
        });
        
        // Join socket room for this chat
        if (socket) {
          socket.emit('join_bargain', chatId);
        }
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
      toast({
        title: "Error",
        description: "Failed to load chat details",
        variant: "destructive"
      });
    }
  };

  // Handle sending messages
  const handleSendMessage = (chatId: string, message: string, isOffer: boolean, offerAmount?: number) => {
    if (!socket) return;
    
    socket.emit('new_message', {
      bargainId: chatId,
      text: message,
      isOffer,
      offerAmount
    });
  };

  // Handle updating bargain status
  const handleUpdateStatus = (chatId: string, newStatus: 'accepted' | 'rejected') => {
    if (!socket) return;
    
    socket.emit('update_status', {
      bargainId: chatId,
      status: newStatus
    });
    
    toast({
      title: `Offer ${newStatus}`,
      description: `You have ${newStatus} the customer's offer.`,
      variant: newStatus === 'accepted' ? 'default' : 'destructive'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Customer Bargaining Chats</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* Chats list sidebar */}
          <div className="md:col-span-1 h-full">
            <Card className="h-full p-4">
              <h2 className="font-semibold text-lg mb-3">Chat Requests</h2>
              <SellerChatsList 
                chats={chats}
                activeChat={selectedChatId}
                onChatSelect={handleChatSelect}
                loading={loading}
              />
            </Card>
          </div>
          
          {/* Chat conversation area */}
          <div className="md:col-span-2 h-full">
            {selectedChatId && selectedChatDetails ? (
              <SellerChatBox 
                chatId={selectedChatId}
                buyerName={selectedChatDetails.buyerName}
                productName={selectedChatDetails.productName}
                initialPrice={selectedChatDetails.initialPrice}
                currentPrice={selectedChatDetails.currentPrice}
                messages={selectedChatDetails.messages}
                status={selectedChatDetails.status}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <Card className="h-full flex flex-col items-center justify-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-3" />
                <p className="text-gray-500">Select a chat to view the conversation</p>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellerChatsPage;
