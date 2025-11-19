// TypeScript type definitions for AuthContext
import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: any }>;
  signInWithGitHub: () => Promise<{ user: User | null; error: any }>;
  getUserDisplayName: () => string;
  getUserInitials: () => string;
  getUserPhotoURL: () => string | null;
  isAuthenticated: boolean;
  // Aliases for backward compatibility
  signup: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  login: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
}
