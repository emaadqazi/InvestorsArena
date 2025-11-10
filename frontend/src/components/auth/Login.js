import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
      } else if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to your account</p>
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
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
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
            <span className="oauth-button-icon">🔵</span>
            Sign in with Google
          </button>

          <button
            type="button"
            className="oauth-button oauth-button-github"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            <span className="oauth-button-icon">⚫</span>
            Sign in with GitHub
          </button>
        </div>

        <div className="auth-link">
          <p>Don't have an account?</p>
          <Link to="/signup" className="link-button">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

