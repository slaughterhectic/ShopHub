import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase'; // Make sure to import your supabase client
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, loading: cartLoading } = useCartStore();
  const { user } = useAuthStore();
  
  // --- STATE FOR WISHLIST ---
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- CHECK WISHLIST STATUS ON LOAD ---
  const checkWishlistStatus = useCallback(async () => {
    if (!user) {
        setIsWishlisted(false);
        return;
    };

    // No need to re-check if we are already processing an action
    if (isProcessing) return;

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'row not found' error
        console.error("Error checking wishlist status:", error.message);
    }
    
    setIsWishlisted(!!data);
  }, [user, product.id, isProcessing]);

  useEffect(() => {
    checkWishlistStatus();
  }, [user, checkWishlistStatus]);


  // --- HANDLERS ---
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    await addItem(product);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }
    
    if (isProcessing) return;
    setIsProcessing(true);

    const originallyWishlisted = isWishlisted;
    // Optimistic UI update
    setIsWishlisted(!originallyWishlisted);

    if (originallyWishlisted) {
      // --- REMOVE FROM WISHLIST ---
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);

      if (error) {
        toast.error('Failed to remove from wishlist.');
        setIsWishlisted(true); // Revert UI on failure
      } else {
        toast.success('Removed from wishlist');
      }
    } else {
      // --- ADD TO WISHLIST ---
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: product.id });

      if (error) {
        toast.error('Failed to add to wishlist.');
        setIsWishlisted(false); // Revert UI on failure
      } else {
        toast.success('Added to wishlist!');
      }
    }
    setIsProcessing(false);
  };

  return (
    <div className="relative bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <div className="aspect-w-1 aspect-h-1 w-full bg-gradient-to-tr from-gray-100 to-gray-200">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs px-3 py-1 rounded-full shadow-sm">
              {product.category}
            </span>

            {/* --- UPDATED WISHLIST BUTTON --- */}
            <button
              onClick={handleToggleWishlist}
              disabled={isProcessing}
              className={clsx(
                "absolute top-3 right-3 backdrop-blur-md p-1.5 rounded-full bg-white/40 transition-colors",
                "hover:bg-white disabled:cursor-not-allowed",
                isWishlisted ? "text-rose-500" : "text-gray-700 hover:text-rose-500"
              )}
              aria-label="Toggle wishlist"
              title="Toggle Wishlist"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={clsx("w-5 h-5 transition-all", isWishlisted && "fill-current")} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-[16px] font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[13px] text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  'w-[16px] h-[16px] transition-all',
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews_count})
            </span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-orange-500 mt-1 animate-pulse">
                Only {product.stock} left!
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-xs text-red-600 mt-1">Out of stock</p>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || cartLoading}
          loading={cartLoading}
          className={clsx(
            'w-full text-white transition-all',
            product.stock > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
          )}
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-300 transition duration-300 pointer-events-none" />
    </div>
  );
};