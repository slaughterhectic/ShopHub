// ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { Product, Review } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { addItem, loading: cartLoading } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setProduct(data);
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select(
          `
          *,
          user:users(full_name, avatar_url)
        `
        )
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    await addItem(product, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Sign in to use wishlist');
      return;
    }

    toast.success('Added to wishlist 💖');
    // TODO: Wishlist functionality goes here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Product not found</h2>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:underline transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {/* Product */}
        <div className="grid lg:grid-cols-2 gap-10 items-start bg-white rounded-xl shadow-md overflow-hidden p-6">
          {/* Image */}
          <div>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-[450px] object-cover rounded-lg"
            />
          </div>

          {/* Info */}
          <div>
            <Badge variant="info" className="mb-3">
              {product.category}
            </Badge>

            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            <div className="flex items-center space-x-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} • {product.reviews_count} reviews
              </span>
            </div>

            <div className="text-4xl font-bold text-blue-600 mb-4">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Badges */}
            {product.stock > 0 ? (
              <p className="mb-4 text-sm text-green-600 font-medium">
                {product.stock} items in stock
              </p>
            ) : (
              <Badge variant="danger" className="mb-4">
                Out of stock
              </Badge>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium px-2 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || cartLoading}
                loading={cartLoading}
                className="w-full sm:w-auto flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                className="w-full sm:w-auto flex-1"
              >
                <Heart className="w-5 h-5 mr-2" />
                Wishlist
              </Button>
            </div>

            {/* Features */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-bold mb-2">Highlights</h2>
              <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                <li>Premium build quality</li>
                <li>Lightning-fast delivery</li>
                <li>30-day return and refund policy</li>
                <li>Trusted by 1,000+ happy customers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Customer Reviews</h2>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="divide-y divide-gray-200 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pt-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-bold text-gray-800">{review.user.full_name}</span>
                    <span className="text-sm text-gray-500">
                      &bull; {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};