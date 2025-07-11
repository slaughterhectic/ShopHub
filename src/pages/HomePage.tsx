import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(8);

      if (data) {
        setFeaturedProducts(data);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Electronics',
      category: 'electronics',
      image:
        'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      name: 'Clothing',
      category: 'clothing',
      image:
        'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      name: 'Home & Garden',
      category: 'home',
      image:
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      name: 'Sports',
      category: 'sports',
      image:
        'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-white">
      
      {/* 🎯 Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-25 z-0"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Discover Amazing Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-blue-100 mb-10"
          >
            Shop the latest trends with unbeatable prices and fast delivery
          </motion.p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/products?category=electronics">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-700"
              >
                Browse Electronics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🚚 Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { Icon: Truck, title: 'Free Shipping', desc: 'Free shipping on orders over $50', color: 'blue' },
              { Icon: Shield, title: 'Secure Payment', desc: 'Your payment information is safe', color: 'green' },
              { Icon: Headphones, title: '24/7 Support', desc: 'Get help whenever you need it', color: 'purple' },
            ].map(({ Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <div className={`bg-${color}-100 p-5 rounded-full mb-4`}>
                  <Icon className={`w-8 h-8 text-${color}-600`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Featured Products */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">
              Discover our handpicked collection of favorites
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading
              ? [...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-80 animate-pulse"
                  />
                ))
              : featuredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🗂️ Categories */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={i}
                className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Link to={`/products?category=${category.category}`}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📰 Newsletter */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-200 mb-6 text-lg">
            Subscribe to our newsletter for the latest deals, promotions & updates
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <Button
              type="submit"
              className="bg-white text-blue-700 hover:bg-blue-50 transition"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};