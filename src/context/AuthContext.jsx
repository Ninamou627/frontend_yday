import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '../services/firebase';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Attempt to load from localStorage on init
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        // Only clear if Firebase logs out
        localStorage.removeItem('user');
        setUser(null);
      } else {
        // If user session is revived, we might want to refresh user data here
        // but for now relying on localStorage cache is okay
      }
      setLoading(false);
    });

    // Listen for global 401 events from axios interceptor
    const handleAuthError = () => {
      logout();
    };
    window.addEventListener('auth-error', handleAuthError);

    return () => {
      unsubscribe();
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const login = async (email, password) => {
    try {
      // 1. Authenticate with Firebase natively
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      // 2. Fetch User from our backend (token injected automatically via api.js interceptor)
      const response = await api.get('/api/profile/me');

      const userData = response.data;

      // 3. Store user data (access_token no longer needed in localStorage)
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Successfully logged in!');
      return userData;

    } catch (error) {
      console.error('Login error:', error);
      if (error.code && error.code.startsWith('auth/')) {
        throw new Error("Invalid credentials. Please verify your email and password.");
      }
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to login. Please verify your email and password.');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (err) {
      console.error("Firebase logout error:", err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      toast('You have been logged out.');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
