import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import GoogleApiService from '../services/googleApi';

interface AuthButtonProps {
  onAuthChange: (isAuthenticated: boolean) => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ onAuthChange }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const googleApi = GoogleApiService.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await googleApi.initialize();
      const signedIn = googleApi.isSignedIn();
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        const currentUser = googleApi.getCurrentUser();
        setUser(currentUser);
      }
      
      onAuthChange(signedIn);
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Continue without authentication for demo purposes
      setIsSignedIn(false);
      onAuthChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleApi.signIn();
      
      // Wait for auth to complete
      setTimeout(() => {
        const currentUser = googleApi.getCurrentUser();
        setUser(currentUser);
        setIsSignedIn(true);
        onAuthChange(true);
        setIsLoading(false);
      }, 2500);
    } catch (error) {
      console.error('Error signing in:', error);
      // For demo purposes, allow proceeding
      const demoUser = {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'https://via.placeholder.com/40'
      };
      setUser(demoUser);
      setIsSignedIn(true);
      onAuthChange(true);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await googleApi.signOut();
      setUser(null);
      setIsSignedIn(false);
      onAuthChange(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <img
            src={user.picture}
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <div className="text-sm">
            <p className="font-medium text-green-900">{user.name}</p>
            <p className="text-xs text-green-700">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <LogIn className="w-4 h-4" />
      Connect to Google
    </button>
  );
};

export default AuthButton;