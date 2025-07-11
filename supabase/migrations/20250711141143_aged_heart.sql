/*
  # Seed Sample Data

  1. Sample Products
    - Electronics category with various devices
    - Clothing category with apparel items
    - Home & Garden category with household items
    - Sports category with fitness equipment

  2. Sample Admin User
    - Create an admin user for testing admin functionality

  3. Sample Reviews
    - Add reviews for products to demonstrate rating system
*/

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock, featured, rating, reviews_count) VALUES
-- Electronics
('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip. Features titanium design and Action Button.', 999.00, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 50, true, 4.8, 124),
('MacBook Air M2', 'Supercharged by M2 chip. Up to 18 hours of battery life. Liquid Retina display.', 1199.00, 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 30, true, 4.9, 89),
('Sony WH-1000XM5', 'Industry-leading noise canceling headphones with exceptional sound quality.', 399.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 75, false, 4.7, 156),
('Samsung 4K Smart TV', '55-inch QLED 4K Smart TV with HDR and built-in streaming apps.', 799.99, 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 25, true, 4.6, 67),
('iPad Pro 12.9"', 'Most advanced iPad with M2 chip, Liquid Retina XDR display, and Apple Pencil support.', 1099.00, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 40, false, 4.8, 92),
('Nintendo Switch OLED', 'Gaming console with vibrant OLED screen and enhanced audio.', 349.99, 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500', 'electronics', 60, true, 4.7, 203),

-- Clothing
('Classic White T-Shirt', 'Premium cotton t-shirt with comfortable fit. Perfect for everyday wear.', 29.99, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 100, false, 4.5, 45),
('Denim Jacket', 'Vintage-style denim jacket with classic fit. Made from sustainable materials.', 89.99, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 45, true, 4.6, 78),
('Running Shoes', 'Lightweight running shoes with advanced cushioning and breathable mesh.', 129.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 80, true, 4.8, 134),
('Wool Sweater', 'Cozy wool sweater perfect for cold weather. Available in multiple colors.', 79.99, 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 35, false, 4.4, 56),
('Leather Handbag', 'Elegant leather handbag with multiple compartments and adjustable strap.', 199.99, 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 25, true, 4.7, 89),
('Summer Dress', 'Flowy summer dress made from breathable fabric. Perfect for warm weather.', 69.99, 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=500', 'clothing', 55, false, 4.5, 67),

-- Home & Garden
('Coffee Maker', 'Programmable coffee maker with thermal carafe and auto-brew feature.', 149.99, 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 40, false, 4.6, 112),
('Indoor Plant Set', 'Collection of easy-care indoor plants perfect for home decoration.', 59.99, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 70, true, 4.8, 89),
('Kitchen Knife Set', 'Professional-grade kitchen knives with ergonomic handles and storage block.', 199.99, 'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 30, false, 4.9, 156),
('Throw Pillows', 'Set of decorative throw pillows in various colors and patterns.', 39.99, 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 90, false, 4.3, 34),
('Dining Table', 'Modern dining table for 6 people. Made from sustainable wood.', 699.99, 'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 15, true, 4.7, 45),
('Garden Tool Set', 'Complete gardening tool set with ergonomic handles and storage case.', 89.99, 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=500', 'home', 50, false, 4.5, 78),

-- Sports
('Yoga Mat', 'Non-slip yoga mat with extra cushioning. Perfect for home workouts.', 49.99, 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 85, true, 4.6, 167),
('Dumbbell Set', 'Adjustable dumbbell set with multiple weight options. Space-saving design.', 299.99, 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 20, false, 4.8, 89),
('Basketball', 'Official size basketball with superior grip and durability.', 39.99, 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 65, false, 4.4, 56),
('Tennis Racket', 'Professional tennis racket with lightweight frame and comfortable grip.', 159.99, 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 35, true, 4.7, 123),
('Fitness Tracker', 'Advanced fitness tracker with heart rate monitoring and GPS.', 199.99, 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 55, true, 4.5, 234),
('Camping Tent', '4-person camping tent with waterproof design and easy setup.', 249.99, 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=500', 'sports', 25, false, 4.6, 67);

-- Note: Sample reviews and admin user creation would require actual user IDs
-- These would typically be added after users are created through the authentication system