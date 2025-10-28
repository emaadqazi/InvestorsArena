// Supabase configuration for InvestorsArena
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_PROJECT_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY

// Debug environment variables
console.log('🔍 Checking Supabase environment variables:')
console.log('REACT_APP_SUPABASE_PROJECT_URL:', supabaseUrl ? 'Found ✅' : 'Missing ❌')
console.log('REACT_APP_SUPABASE_API_KEY:', supabaseKey ? 'Found ✅' : 'Missing ❌')

// Check if environment variables are configured
const hasEnvVars = supabaseUrl && supabaseKey

if (!hasEnvVars) {
  console.error('🔥 Missing Supabase environment variables!')
  console.error('📁 Please create a .env.local file in the frontend/ directory with:')
  console.error('   REACT_APP_SUPABASE_PROJECT_URL=your_project_url')
  console.error('   REACT_APP_SUPABASE_API_KEY=your_api_key')
  console.error('🔄 Then restart your development server (npm start)')
} else {
  console.log('🎉 Supabase configuration loaded successfully!')
}

// Create either real or mock Supabase client
export const supabase = hasEnvVars 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    })
  : {
      // Mock client for development without env vars
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (callback) => {
          callback('SIGNED_OUT', null)
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
        updateUser: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } })
      }
    }

// Auth helper functions
export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables in .env.local file' } }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in existing user
  async signIn(email, password) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables in .env.local file' } }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    if (!hasEnvVars) {
      return { error: null }
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    if (!hasEnvVars) {
      return { user: null, error: null }
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getSession() {
    if (!hasEnvVars) {
      return { session: null, error: null }
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables in .env.local file' } }
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  // Update user profile
  async updateProfile(updates) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables in .env.local file' } }
    }
    
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    return { data, error }
  }
}

export default supabase