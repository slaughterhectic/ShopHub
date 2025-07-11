import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ShieldCheck, ChevronRight, PackageOpen } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button'; // Assuming you have a styled Button component
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-component for a single Cart Item ---
const CartItem = ({ item, onUpdateQuantity, onRemoveItem, loading }) => {
  const stockLimit = item.product.stock;
  const isAtStockLimit = item.quantity >= stockLimit;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <img
        src={item.product.image_url}
        alt={item.product.name}
        className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-grow">
        <Link
          to={`/products/${item.product.id}`}
          className="text-lg font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-slate-500 mt-1">{item.product.category}</p>
        <p className="text-md font-medium text-slate-600 mt-2 sm:hidden">
          ${item.product.price.toFixed(2)}
        </p>
         {isAtStockLimit && (
          <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block">
            Max quantity reached
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-full p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          disabled={loading}
          className="rounded-full w-8 h-8"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-lg font-medium text-slate-800 w-10 text-center tabular-nums">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          disabled={loading || isAtStockLimit}
          className="rounded-full w-8 h-8"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-right w-full sm:w-auto">
        <p className="text-xl font-semibold text-slate-900">
          ${(item.product.price * item.quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.product_id)}
          disabled={loading}
          className="text-slate-500 hover:text-red-600 mt-1 px-2"
        >
          <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
          <span className="sm:hidden">Remove</span>
        </Button>
      </div>
    </motion.div>
  );
};

// --- Sub-component for the Order Summary ---
const OrderSummary = ({ total, onCheckout }) => {
  const FREE_SHIPPING_THRESHOLD = 50;
  const TAX_RATE = 0.08;
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const taxAmount = total * TAX_RATE;
  const finalTotal = total + shippingCost + taxAmount;
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="bg-slate-50/80 rounded-xl shadow-sm p-6 sticky top-24 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
      
      {/* Free Shipping Progress */}
      {total < FREE_SHIPPING_THRESHOLD && (
        <div className="mb-6">
          <p className="text-sm text-slate-700 mb-2">
            Add <span className="font-bold text-indigo-600">${(FREE_SHIPPING_THRESHOLD - total).toFixed(2)}</span> more for FREE Shipping.
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div 
              className="bg-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${shippingProgress}%`}}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Costs Breakdown */}
      <dl className="space-y-3 text-slate-600">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium text-slate-800">${total.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd className="font-medium text-slate-800">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</dd></div>
        <div className="flex justify-between"><dt>Tax (8%)</dt><dd className="font-medium text-slate-800">${taxAmount.toFixed(2)}</dd></div>
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <dt>Total</dt><dd>${finalTotal.toFixed(2)}</dd>
          </div>
        </div>
      </dl>

      <Button onClick={onCheckout} className="w-full mt-8" size="lg">
        Proceed to Checkout
      </Button>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Secure SSL Checkout</span>
      </div>
    </div>
  );
};

// --- Sub-component for the Empty Cart view ---
const EmptyCartView = () => (
  <div className="text-center py-24">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
    >
      <PackageOpen className="mx-auto h-28 w-28 text-slate-300 mb-6" />
      <h2 className="text-3xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
      <p className="text-lg text-slate-500 mb-8">Add items to your cart to see them here.</p>
      <Link to="/products">
        <Button size="lg" className="gap-2">
          <ShoppingBag className="w-5 h-5" />
          Start Shopping
        </Button>
      </Link>
    </motion.div>
  </div>
);

// --- Main Cart Page Component ---
export const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, loading } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs & Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
              <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link to="/" className="hover:text-slate-700">Home</Link>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-slate-700 font-semibold">Shopping Cart</span>
              </nav>
              <h1 className="text-4xl font-bold text-slate-900 mt-2">Your Cart</h1>
            </div>
            {items.length > 0 && (
                <Link to="/products" className="hidden sm:inline-flex">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Button>
                </Link>
            )}
        </div>

        {items.length === 0 ? (
          <EmptyCartView />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-7">
              <div className="space-y-6">
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleQuantityChange}
                      onRemoveItem={async (productId) => {
                        await removeItem(productId);
                        toast.success('Item removed from cart');
                      }}
                      loading={loading}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-5 mt-10 lg:mt-0">
              <OrderSummary total={total} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};