import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Loader2, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Define TypeScript types based on the schema
interface Product {
  id: string;
  name: string;
  image_url: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: Product;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_items: OrderItem[];
}

const MyOrders: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in to view your orders.");
        return;
      }

      try {
        setLoading(true);
        // The query remains the same
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, status, order_items(id, quantity, price, products(id, name, image_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // --- START OF FIX ---
        // Manually map the data to ensure it conforms to our TypeScript interfaces.
        // This is the most type-safe way to handle complex nested data from an API.
        if (data) {
          const mappedOrders: Order[] = data.map((order: any) => ({
            id: order.id,
            created_at: order.created_at,
            total_amount: order.total_amount,
            status: order.status,
            order_items: order.order_items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              // The 'products' relation might be an object or null
              products: item.products ? {
                id: item.products.id,
                name: item.products.name,
                image_url: item.products.image_url,
              } : { id: '', name: 'Unknown Product', image_url: '' }, // Fallback for safety
            })),
          }));
          setOrders(mappedOrders);
        }
        // --- END OF FIX ---

      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12" />
          <h2 className="text-xl font-semibold">An Error Occurred</h2>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          My Orders
        </motion.h1>

        {orders.length === 0 ? (
          <motion.div 
            className="text-center bg-white p-8 md:p-12 rounded-xl shadow-md border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">No Orders Yet</h2>
            <p className="mt-2 text-gray-600">
              You haven't placed any orders. When you do, they'll appear here.
            </p>
            <div className="mt-6">
              <Link to="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {orders.map((order) => (
              <motion.div 
                key={order.id} 
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                variants={itemVariants}
              >
                {/* Card Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-1">
                    <div>
                      <span className="text-sm text-gray-500">Order ID</span>
                      <p className="font-semibold text-gray-800">#{order.id.substring(0, 8)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date Placed</span>
                      <p className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                     <span className={`text-sm font-bold py-1 px-3 rounded-full capitalize ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                     <p className="text-lg font-bold text-gray-800">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-4 text-gray-700">Items</h3>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded-md bg-gray-100"
                        />
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{item.products.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MyOrders;