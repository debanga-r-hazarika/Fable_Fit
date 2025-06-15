import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribed = false;
    let authStateHandled = false;

    console.log('AuthContext: Initializing auth state...');

    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (unsubscribed) return;
      console.log('AuthContext: Auth state changed:', event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      if (!authStateHandled) {
        setLoading(false);
        authStateHandled = true;
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (unsubscribed) return;
      if (error) {
        console.error('AuthContext: Error getting initial session:', error);
      } else {
        console.log('AuthContext: Initial session:', session ? 'Found' : 'None');
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (!authStateHandled) {
        setLoading(false);
        authStateHandled = true;
      }
    });

    return () => {
      unsubscribed = true;
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Handle profile creation/update when user signs in
  useEffect(() => {
    async function ensureProfile() {
      if (user) {
        try {
          // Check if profile already exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            // Error other than "not found"
            console.error('AuthContext: Error checking existing profile:', fetchError);
            return;
          }

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            console.log('AuthContext: Creating new profile for user:', user.id);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || '',
                email: user.email || '',
                is_admin: false,
              });

            if (insertError) {
              console.error('AuthContext: Error creating profile:', insertError);
            } else {
              console.log('AuthContext: Profile created successfully');
            }
          } else {
            console.log('AuthContext: Profile already exists');
          }
        } catch (error) {
          // Log the error but don't throw - profile creation failure shouldn't break auth
          console.error('AuthContext: Unexpected error with profile:', error);
        }
      }
    }
    ensureProfile();
  }, [user]);

  const signOut = async () => {
    console.log('AuthContext: Signing out user...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      console.log('AuthContext: Successfully signed out');
    } catch (error) {
      console.error('AuthContext: Failed to sign out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  console.log('AuthContext: Current state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}