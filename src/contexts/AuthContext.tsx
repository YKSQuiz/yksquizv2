
"use client";

import type { User } from 'firebase/auth';
import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode 
} from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<User | AuthError>;
  signupWithEmail: (email: string, pass: string) => Promise<User | AuthError>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void | AuthError>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<User | AuthError> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string): Promise<User | AuthError> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void | AuthError> => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
        return error as AuthError;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithEmail,
    signupWithEmail,
    logoutUser,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
