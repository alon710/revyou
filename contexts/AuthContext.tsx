'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/lib/firebase/auth';

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
