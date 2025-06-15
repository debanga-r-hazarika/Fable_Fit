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
    console.log('AuthContext: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthContext: Error getting initial session:', error);
      } else {
        console.log('AuthContext: Initial session:', session ? 'Found' : 'None');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create or update profile when user signs up or signs in
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('AuthContext: User signed in, checking/creating profile');
        try {
          // Check if profile already exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            // Error other than "not found"
            console.error('AuthContext: Error checking existing profile:', fetchError);
            return;
          }

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            console.log('AuthContext: Creating new profile for user:', session.user.id);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata.full_name || '',
                email: session.user.email || '',
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

      if (event === 'SIGNED_OUT') {
        console.log('AuthContext: User signed out');
      }
    });

    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

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