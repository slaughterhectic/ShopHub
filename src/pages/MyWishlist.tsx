import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Loader2, Heart, AlertCircle, X, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

// Define TypeScript types based on the schema
interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface WishlistItem {
  id: string; // The ID of the wishlist entry itself
  products: Product;
}

const MyWishlist: React.FC = () => {
  const { user } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in to view your wishlist.");
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('wishlist')
          .select('id, products(id, name, price, image_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // --- START OF FIX ---
        // Instead of a simple type assertion, we filter and then explicitly map the data.
        // This guarantees type safety and resolves the TypeScript error.
        if (data) {
          const mappedItems: WishlistItem[] = data
            // First, filter out any entries where the associated product might have been deleted.
            .filter(item => item.products !== null)
            // Then, map the valid data to our strict WishlistItem interface.
            .map((item: any) => ({
              id: item.id,
              products: {
                id: item.products.id,
                name: item.products.name,
                price: item.products.price,
                image_url: item.products.image_url,
              }
            }));
          setWishlistItems(mappedItems);
        }
        // --- END OF FIX ---

      } catch (err: any) {
        console.error("Error fetching wishlist:", err);
        setError(err.message || "Failed to fetch wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveItem = async (wishlistItemId: string) => {
    const originalItems = [...wishlistItems];
    setWishlistItems(currentItems => currentItems.filter(item => item.id !== wishlistItemId));

    const { error: deleteError } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistItemId);

    if (deleteError) {
      toast.error("Failed to remove item. Please try again.");
      setWishlistItems(originalItems);
      console.error("Error removing from wishlist:", deleteError);
    } else {
      toast.success("Item removed from wishlist!");
    }
  };
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2 }
    }
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
        <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
           <div className="flex items-center gap-2 text-pink-500">
                <Heart className="w-8 h-8 fill-current" />
                <span className="text-2xl font-bold">{wishlistItems.length}</span>
           </div>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            className="text-center bg-white p-8 md:p-12 rounded-xl shadow-md border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Wishlist is Empty</h2>
            <p className="mt-2 text-gray-600">
              Looks like you haven't added anything yet. Find something you love!
            </p>
            <div className="mt-6">
              <Link to="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                  <ShoppingBag className="w-4 h-4 mr-2"/>
                  Explore Products
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
                {wishlistItems.map((item) => (
                <motion.div 
                    key={item.id} 
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group relative"
                    variants={itemVariants}
                    exit="exit"
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleRemoveItem(item.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-white/70 rounded-full text-gray-500 hover:text-red-500 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        aria-label="Remove from wishlist"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                    <Link to={`/products/${item.products.id}`} className="block">
                        <div className="aspect-square overflow-hidden">
                            <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-800 truncate">{item.products.name}</h3>
                            <p className="text-lg font-bold text-gray-900 mt-1">${item.products.price.toFixed(2)}</p>
                        </div>
                    </Link>
                </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MyWishlist;