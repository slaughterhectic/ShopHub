import { create } from 'zustand';
import { User } from '../types';
import { supabase, getCurrentUser } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  initialize: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      const { user: authUser } = await getCurrentUser();
      
      if (authUser) {
        // Fetch user profile from database
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profile) {
          set({ user: profile });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          set({ user: profile });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null });
      }
    });
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));