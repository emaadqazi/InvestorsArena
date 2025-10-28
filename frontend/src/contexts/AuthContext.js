// Authentication Context for InvestorsArena
import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await authService.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Sign up function
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await authService.signUp(email, password, {
        full_name: userData.fullName,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await authService.signOut()
      
      if (error) {
        throw error
      }
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      const { data, error } = await authService.updateProfile(updates)
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    
    // Try user metadata first
    const metadata = user.user_metadata || {}
    if (metadata.full_name) return metadata.full_name
    if (metadata.first_name) return metadata.first_name
    
    // Fallback to email username
    if (user.email) {
      return user.email.split('@')[0]
    }
    
    return 'User'
  }

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'G'
    
    const metadata = user.user_metadata || {}
    
    // Try to get initials from first/last name
    if (metadata.first_name && metadata.last_name) {
      return `${metadata.first_name[0]}${metadata.last_name[0]}`.toUpperCase()
    }
    
    // Try full name
    if (metadata.full_name) {
      const names = metadata.full_name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    
    // Fallback to email
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    
    return 'U'
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getUserDisplayName,
    getUserInitials,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
