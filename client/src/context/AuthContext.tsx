import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  signInAnonymously
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { app } from '../lib/firebase';

interface AuthContextProps {
  user: User | null;
  username: string | null;
  isLoading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAsGuest: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUsername: (name: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Load username from localStorage if it exists
    const savedUsername = localStorage.getItem('localwave_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed in successfully",
        description: "Welcome back to LocalWave!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to sign in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account created",
        description: "Welcome to LocalWave!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async (username: string) => {
    try {
      setIsLoading(true);
      await signInAnonymously(auth);
      setUsername(username);
      localStorage.setItem('localwave_username', username);
      toast({
        title: "Signed in as guest",
        description: `Welcome, ${username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to sign in as guest",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('localwave_username');
      setUsername(null);
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to sign out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSetUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem('localwave_username', name);
  };

  return (
    <AuthContext.Provider value={{
      user,
      username,
      isLoading,
      isOnline,
      signIn,
      signUp,
      signInAsGuest,
      signOut,
      setUsername: handleSetUsername
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
