import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/supabase';
import '../../styles/auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithGitHub } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      throw new Error('Please fill in all fields');
    }

    if (!formData.email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      // Step 1: Firebase registration
      const { user, error } = await signup(formData.email, formData.password);
      
      if (error) {
        throw error;
      }
      
      console.log('Firebase registration successful for:', user.email);
      
      // Step 2: Create user profile in Supabase
      const { error: profileError } = await userService.createUserProfile(
        user.uid,
        user.email,
        {
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      );
      
      if (profileError) {
        console.error('Supabase profile creation error:', profileError);
        // Don't throw error - user is created in Firebase, profile is optional
        console.warn('User created in Firebase but profile creation failed');
      }
      
      console.log('Registration successful for:', user.email);
      
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      // Clear form and redirect to dashboard
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to dashboard after showing success message
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      console.error('Signup error:', err);
      
      // Provide user-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }

      console.log('Google signup successful:', user.email);
      
      // Create or update Supabase profile
      const { error: profileError } = await userService.createUserProfile(
        user.uid,
        user.email,
        {
          firstName: user.displayName?.split(' ')[0] || null,
          lastName: user.displayName?.split(' ').slice(1).join(' ') || null
        }
      );
      
      if (profileError && !profileError.message?.includes('duplicate')) {
        console.warn('Profile creation warning:', profileError);
      }
      
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user, error } = await signInWithGitHub();
      
      if (error) {
        throw error;
      }

      console.log('GitHub signup successful:', user.email);
      
      // Create or update Supabase profile
      const { error: profileError } = await userService.createUserProfile(
        user.uid,
        user.email,
        {
          firstName: user.displayName?.split(' ')[0] || null,
          lastName: user.displayName?.split(' ').slice(1).join(' ') || null
        }
      );
      
      if (profileError && !profileError.message?.includes('duplicate')) {
        console.warn('Profile creation warning:', profileError);
      }
      
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      console.error('GitHub signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">InvestorsArena</div>
          <h1 className="auth-title">Demo Registration</h1>
          <p className="auth-subtitle">
            Create a demo account to explore the platform
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="oauth-divider">
          <span className="oauth-divider-text">OR</span>
        </div>

        <div className="oauth-buttons">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="oauth-button oauth-button-google"
          >
            <span className="oauth-button-icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </span>
            {loading ? 'Creating Account...' : 'Continue with Google'}
          </button>

          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="oauth-button oauth-button-github"
          >
            <span className="oauth-button-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </span>
            {loading ? 'Creating Account...' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="auth-link">
          <p>Already have an account?</p>
          <button 
            className="link-button"
            onClick={() => navigate('/login')}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
