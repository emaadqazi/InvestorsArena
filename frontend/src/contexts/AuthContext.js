// Firebase Authentication Context for InvestorsArena
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';

import { auth } from '../firebase/config';
import { userService } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email || 'signed out');
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Sign up function - creates Firebase user
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('User signed up successfully:', firebaseUser.email);

      // Create user profile in Supabase database
      const { error: dbError } = await userService.createUserProfile(
        firebaseUser.uid,
        firebaseUser.email,
        userData
      );

      if (dbError) {
        console.error('Failed to create user profile in database:', dbError);
        // Note: We don't fail the signup if database creation fails
        // The user is still authenticated in Firebase
      }

      // Return user data in consistent format
      return {
        user: firebaseUser,
        error: null
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        user: null,
        error
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function - authenticates with email/password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('User signed in successfully:', firebaseUser.email);
      
      return { 
        user: firebaseUser, 
        error: null 
      };
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        user: null, 
        error 
      };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In function
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Create Google provider
      const provider = new GoogleAuthProvider();

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      console.log('User signed in with Google:', firebaseUser.email);

      // Check if user profile exists in database
      const { data: existingProfile } = await userService.getUserProfile(firebaseUser.uid);

      // Create profile only if it doesn't exist (new user)
      if (!existingProfile) {
        const { error: dbError } = await userService.createUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
          {
            firstName: firebaseUser.displayName?.split(' ')[0] || null,
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null
          }
        );

        if (dbError) {
          console.error('Failed to create user profile in database:', dbError);
        }
      }

      return {
        user: firebaseUser,
        error: null
      };
    } catch (error) {
      console.error('Google signin error:', error);
      return {
        user: null,
        error
      };
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign In function
  const signInWithGitHub = async () => {
    try {
      setLoading(true);

      // Create GitHub provider
      const provider = new GithubAuthProvider();

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      console.log('User signed in with GitHub:', firebaseUser.email);

      // Check if user profile exists in database
      const { data: existingProfile } = await userService.getUserProfile(firebaseUser.uid);

      // Create profile only if it doesn't exist (new user)
      if (!existingProfile) {
        const { error: dbError } = await userService.createUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
          {
            firstName: firebaseUser.displayName?.split(' ')[0] || null,
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null
          }
        );

        if (dbError) {
          console.error('Failed to create user profile in database:', dbError);
        }
      }

      return {
        user: firebaseUser,
        error: null
      };
    } catch (error) {
      console.error('GitHub signin error:', error);
      return {
        user: null,
        error
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      console.log('User signed out successfully');
      
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Alias functions for backward compatibility with components
  const signup = signUp;
  const login = signIn;

  // Get user display name helper
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  // Get user initials helper
  const getUserInitials = () => {
    if (!user) return 'G';
    
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  // Get user profile picture
  const getUserPhotoURL = () => {
    if (!user) return null;
    return user.photoURL;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    getUserDisplayName,
    getUserInitials,
    getUserPhotoURL,
    isAuthenticated: !!user,
    // Aliases for backward compatibility
    signup,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
