import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Send,
  ArrowRight,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/products' },
      { name: 'New Arrivals', href: '/products?sort=newest' },
      { name: 'Best Sellers', href: '/products?sort=popular' },
      { name: 'Sale Items', href: '/products?sale=true' }
    ],
    categories: [
      { name: 'Electronics', href: '/products?category=electronics' },
      { name: 'Clothing', href: '/products?category=clothing' },
      { name: 'Home & Garden', href: '/products?category=home' },
      { name: 'Sports & Outdoors', href: '/products?category=sports' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'FAQ', href: '/faq' }
    ],
    account: [
      { name: 'My Profile', href: '/profile' },
      { name: 'Order History', href: '/orders' },
      { name: 'Wishlist', href: '/wishlist' },
      { name: 'Track Order', href: '/track-order' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
              <p className="text-blue-100">Get exclusive deals and updates delivered to your inbox</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Subscribe
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Package className="w-8 h-8 text-blue-600" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-800">ShopHub</span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your trusted destination for quality products, exceptional service, and unbeatable prices. Shop with confidence.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Shop
              <div className="h-px bg-gradient-to-r from-blue-600 to-transparent flex-1" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Categories
              <div className="h-px bg-gradient-to-r from-purple-600 to-transparent flex-1" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Support
              <div className="h-px bg-gradient-to-r from-green-600 to-transparent flex-1" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Account
              <div className="h-px bg-gradient-to-r from-pink-600 to-transparent flex-1" />
            </h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <motion.a
              href="mailto:support@shophub.com"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-xs">support@shophub.com</p>
              </div>
            </motion.a>

            <motion.a
              href="tel:+15551234567"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 group-hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                <Phone className="w-5 h-5 text-green-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-xs">+1 (555) 123-4567</p>
              </div>
            </motion.a>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 text-gray-600 group"
            >
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
                <MapPin className="w-5 h-5 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium">Visit Us</p>
                <p className="text-xs">123 Commerce St, City, State</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>© 2024 ShopHub. Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>by ShopHub Team</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};