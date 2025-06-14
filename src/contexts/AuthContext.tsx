
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll use a valid UUID format
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
      email: 'demo@ecoecho.com'
    };
    
    setUser(demoUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: email
    };
    setUser(demoUser);
  };

  const signUp = async (email: string, password: string) => {
    // Mock sign up
    const demoUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: email
    };
    setUser(demoUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
