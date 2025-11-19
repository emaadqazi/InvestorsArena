// Supabase Database Configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY || ''

// Debug environment variables
console.log('🔍 Checking Supabase environment variables:')
console.log('REACT_APP_SUPABASE_PROJECT_URL:', supabaseUrl ? 'Found ✅' : 'Missing ❌')
console.log('REACT_APP_SUPABASE_API_KEY:', supabaseKey ? 'Found ✅' : 'Missing ❌')

// Check if environment variables are configured
const hasEnvVars = supabaseUrl && supabaseKey

if (!hasEnvVars) {
  console.error('🔥 Missing Supabase environment variables!')
  console.error('📁 Please create a .env file in the frontend/ directory with:')
  console.error('   REACT_APP_SUPABASE_PROJECT_URL=your_project_url')
  console.error('   REACT_APP_SUPABASE_API_KEY=your_api_key')
  console.error('🔄 Then restart your development server (npm start)')
  console.error('⚠️ Note: Supabase is used for DATABASE storage only. Firebase handles authentication.')
} else {
  console.log('🎉 Supabase configuration loaded successfully!')
  console.log('📊 Supabase is configured for DATABASE operations only')
}

// Create Supabase client for database operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// Database helper functions for user operations
export const userService = {
  // Create user profile in Supabase after Firebase signup
  async createUserProfile(firebaseUid: string, email: string, userData: any = {}) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables' } }
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          email: email,
          first_name: userData.firstName || null,
          last_name: userData.lastName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error creating user profile:', error)
        return { data: null, error }
      }

      console.log('✅ User profile created in Supabase:', email)
      return { data, error: null }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return { data: null, error }
    }
  },

  // Get user profile by Firebase UID
  async getUserProfile(firebaseUid: string) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables' } }
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return { data: null, error }
    }
  },

  // Update user profile
  async updateUserProfile(firebaseUid: string, updates: any) {
    if (!hasEnvVars) {
      return { data: null, error: { message: 'Please configure Supabase environment variables' } }
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUid)
        .select()

      if (error) {
        console.error('Error updating user profile:', error)
        return { data: null, error }
      }

      console.log('✅ User profile updated:', firebaseUid)
      return { data, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return { data: null, error }
    }
  }
}

export default supabase
