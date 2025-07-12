import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  Package,
  ChevronDown,
  LogOut,
  ShoppingBag,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-1.5 text-sm">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Free shipping on orders over $50!
          <Sparkles className="w-4 h-4" />
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Package className="w-8 h-8 text-blue-600" />
              <motion.div
                className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
              />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShopHub
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <motion.div 
              className="relative w-full"
              animate={{ scale: searchFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-12 pr-4 py-3 rounded-full border-2 transition-all duration-300 ${
                  searchFocused 
                    ? 'border-blue-500 shadow-lg shadow-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none`}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-blue-50"
              >
                Products
              </motion.button>
            </Link>

            {user ? (
              <>
                <Link to="/wishlist">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-700 hover:text-pink-500 transition-colors rounded-lg hover:bg-pink-50"
                  >
                    <Heart className="w-6 h-6" />
                  </motion.button>
                </Link>

                <Link to="/cart">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>

                <div className="relative group ml-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full hover:from-blue-100 hover:to-purple-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                      {user.avatar_url ? (
                        <img
                          src={`${user.avatar_url}?t=${new Date().getTime()}`}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                  </motion.button>

                  {/* Enhanced Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden origin-top-right"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                          {user.avatar_url ? (
                            <img
                              src={`${user.avatar_url}?t=${new Date().getTime()}`}
                              alt={user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 truncate">{user.full_name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                        <span>My Orders</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                    
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/cart">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {/* Search on Mobile */}
                <form onSubmit={handleSearch} className="px-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </form>

                {/* Nav Links */}
                <nav className="px-2 space-y-1">
                  <Link 
                    to="/products" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Products</span>
                  </Link>

                  {user ? (
                    <>
                      <Link 
                        to="/wishlist" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="w-5 h-5" />
                        <span>Wishlist</span>
                      </Link>
                      <Link 
                        to="/cart" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Cart {itemCount > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{itemCount}</span>}</span>
                      </Link>
                      
                      <div className="my-2 px-4">
                        <div className="h-px bg-gray-200" />
                      </div>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Orders</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <div className="my-2 px-4">
                        <div className="h-px bg-gray-200" />
                      </div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/cart" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Cart {itemCount > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{itemCount}</span>}</span>
                      </Link>
                      
                      <div className="my-2 px-4">
                        <div className="h-px bg-gray-200" />
                      </div>
                      
                      <div className="px-2 space-y-2">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button 
                            variant="outline" 
                            className="w-full border-2 hover:border-blue-600 hover:text-blue-600"
                          >
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};