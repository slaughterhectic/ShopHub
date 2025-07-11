import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  loading: boolean;
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: (userId: string) => Promise<void>;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      total: 0,
      itemCount: 0,

      calculateTotals: () => {
        const items = get().items;
        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ total, itemCount });
      },

      addItem: async (product, quantity = 1) => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // Handle guest cart
            const items = get().items;
            const existingItem = items.find(item => item.product_id === product.id);
            
            if (existingItem) {
              const updatedItems = items.map(item =>
                item.product_id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
              set({ items: updatedItems });
            } else {
              const newItem: CartItem = {
                id: `temp-${Date.now()}`,
                user_id: 'guest',
                product_id: product.id,
                quantity,
                product,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              set({ items: [...items, newItem] });
            }
            
            get().calculateTotals();
            toast.success('Added to cart');
            return;
          }

          // Handle authenticated user cart
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .single();

          if (existingItem) {
            const { data: updatedItem } = await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + quantity })
              .eq('id', existingItem.id)
              .select('*, product:products(*)')
              .single();

            if (updatedItem) {
              const items = get().items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              );
              set({ items });
            }
          } else {
            const { data: newItem } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: product.id,
                quantity,
              })
              .select('*, product:products(*)')
              .single();

            if (newItem) {
              set({ items: [...get().items, newItem] });
            }
          }

          get().calculateTotals();
          toast.success('Added to cart');
        } catch (error) {
          console.error('Error adding to cart:', error);
          toast.error('Failed to add to cart');
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (productId) => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            // Handle guest cart
            const items = get().items.filter(item => item.product_id !== productId);
            set({ items });
            get().calculateTotals();
            toast.success('Removed from cart');
            return;
          }

          const item = get().items.find(item => item.product_id === productId);
          if (item) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('id', item.id);

            const items = get().items.filter(item => item.product_id !== productId);
            set({ items });
            get().calculateTotals();
            toast.success('Removed from cart');
          }
        } catch (error) {
          console.error('Error removing from cart:', error);
          toast.error('Failed to remove from cart');
        } finally {
          set({ loading: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            // Handle guest cart
            const items = get().items.map(item =>
              item.product_id === productId ? { ...item, quantity } : item
            );
            set({ items });
            get().calculateTotals();
            return;
          }

          const item = get().items.find(item => item.product_id === productId);
          if (item) {
            const { data: updatedItem } = await supabase
              .from('cart_items')
              .update({ quantity })
              .eq('id', item.id)
              .select('*, product:products(*)')
              .single();

            if (updatedItem) {
              const items = get().items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              );
              set({ items });
              get().calculateTotals();
            }
          }
        } catch (error) {
          console.error('Error updating quantity:', error);
          toast.error('Failed to update quantity');
        } finally {
          set({ loading: false });
        }
      },

      clearCart: async () => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id);
          }

          set({ items: [], total: 0, itemCount: 0 });
          toast.success('Cart cleared');
        } catch (error) {
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        } finally {
          set({ loading: false });
        }
      },

      loadCart: async (userId) => {
        set({ loading: true });
        
        try {
          const { data: items } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', userId);

          if (items) {
            set({ items });
            get().calculateTotals();
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);