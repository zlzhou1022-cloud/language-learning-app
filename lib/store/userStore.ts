/**
 * User State Management with Zustand
 * 管理用户信息状态，实现昵称即时同步
 */

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  nickname: string | null;
  preferred_language: string;
}

interface UserStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ profile: null, loading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({ 
        profile: profile as UserProfile, 
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        loading: false 
      });
    }
  },

  updateNickname: async (nickname: string) => {
    const { profile } = get();
    if (!profile) return;

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ nickname })
        .eq('id', profile.id);

      if (error) throw error;

      // 立即更新本地状态
      set({ 
        profile: { ...profile, nickname },
        loading: false 
      });
    } catch (error) {
      console.error('Failed to update nickname:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update nickname',
        loading: false 
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({ profile: null, loading: false, error: null });
  },
}));
