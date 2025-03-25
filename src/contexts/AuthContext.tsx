import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getIdToken,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useSnackbar } from './SnackbarContext';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // Refresh token every 55 minutes

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  const refreshToken = async () => {
    if (currentUser) {
      try {
        const newToken = await getIdToken(currentUser, true);
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
      } catch (error) {
        showSnackbar('Session expired. Please sign in again.', 'error');
        console.error('Error refreshing token:', error);
        await logout();
      }
    }
  };

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);
      
      // Get the Google OAuth access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (!accessToken) {
        throw new Error('Failed to get Google access token');
      }

      // Store the access token for Google Drive operations
      localStorage.setItem('googleAccessToken', accessToken);
      setToken(token);
      localStorage.setItem('authToken', token);
      showSnackbar('Successfully signed in with Google!', 'success');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        showSnackbar('Sign-in cancelled', 'info');
      } else if (error.code === 'auth/popup-blocked') {
        showSnackbar('Popup was blocked. Please allow popups and try again', 'error');
      } else {
        showSnackbar('Failed to sign in with Google', 'error');
        console.error('Error signing in with Google:', error);
      }
      throw error;
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(result.user);
      setToken(token);
      localStorage.setItem('authToken', token);
      showSnackbar('Account created successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to create account', 'error');
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(result.user);
      setToken(token);
      localStorage.setItem('authToken', token);
      showSnackbar('Successfully signed in!', 'success');
    } catch (error) {
      console.error('Error signing in:', error);
      showSnackbar('Invalid email or password', 'error');
      throw error;
    }
  }

  async function logout() {
    try {
      await firebaseSignOut(auth);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('googleAccessToken');
      showSnackbar('Successfully signed out', 'info');
    } catch (error) {
      console.error('Error signing out:', error);
      showSnackbar('Failed to sign out', 'error');
      throw error;
    }
  }

  useEffect(() => {
    // Set up authentication state observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await getIdToken(user);
        setToken(token);
        localStorage.setItem('authToken', token);
      } else {
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('googleAccessToken');
      }
      setLoading(false);
    });

    // Set up token refresh interval
    const tokenRefreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  // Initialize token from localStorage if it exists
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const value = {
    currentUser,
    token,
    signInWithGoogle,
    signUp,
    signIn,
    logout,
    loading,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}