import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Chrome, Github } from 'lucide-react';
import '../../styles/auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { user, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
      } else if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { user, error: signInError } = await signInWithGoogle();
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in with Google');
      } else if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { user, error: signInError } = await signInWithGitHub();
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in with GitHub');
      } else if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('GitHub sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">INVESTORS ARENA</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to start investing</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password (min. 6 characters)"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : (
              <>
                Sign Up
                <UserPlus className="ml-2" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="oauth-divider">
          <span className="oauth-divider-text">OR</span>
        </div>

        <div className="oauth-buttons">
          <button
            type="button"
            className="oauth-button oauth-button-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="oauth-button-icon" size={20} />
            Sign up with Google
          </button>

          <button
            type="button"
            className="oauth-button oauth-button-github"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            <Github className="oauth-button-icon" size={20} />
            Sign up with GitHub
          </button>
        </div>

        <div className="auth-link">
          <p>Already have an account?</p>
          <Link to="/login" className="link-button">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

