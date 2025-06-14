
import React, { createContext, useContext, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default user for development
const defaultUser: User = {
  id: 'default-user-id',
  email: 'demo@ecoecho.com',
  user_metadata: {
    full_name: 'Demo User'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  phone: null,
  confirmation_sent_at: null,
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change_sent_at: null,
  new_phone: null,
  phone_change_sent_at: null,
  phone_confirmed_at: null,
  email_change_confirm_status: 0,
  banned_until: null,
  identities: []
};

const defaultSession: Session = {
  access_token: 'default-access-token',
  refresh_token: 'default-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: defaultUser
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>(defaultUser);
  const [session] = useState<Session | null>(defaultSession);
  const [loading] = useState(false);

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Mock function for now
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock function for now
    return { error: null };
  };

  const signOut = async () => {
    // Mock function for now
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
