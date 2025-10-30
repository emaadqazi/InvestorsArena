import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/navigation.css';

const Navigation = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, getUserDisplayName, getUserInitials, getUserPhotoURL } = useAuth();

  const handleLogout = async () => {
    setIsProfileOpen(false);
    console.log('Logging out user');
    
    const { error } = await signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      navigate('/login');
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-section')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  // Get real user data from Firebase auth
  const displayName = getUserDisplayName();
  const initials = getUserInitials();
  const photoURL = getUserPhotoURL();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div 
          className="navbar-logo"
          onClick={() => navigate('/dashboard')}
        >
          INVESTORS ARENA
        </div>
      </div>

      <div className="navbar-center">
        <div className="nav-links">
          <div
            className={`nav-link ${location.pathname === '/leagues' ? 'active' : ''}`}
            onClick={() => navigate('/leagues')}
          >
            LEAGUES
          </div>
          <div
            className={`nav-link ${location.pathname === '/stocks' ? 'active' : ''}`}
            onClick={() => navigate('/stocks')}
          >
            STOCKS
          </div>
          <div
            className={`nav-link ${location.pathname === '/market' ? 'active' : ''}`}
            onClick={() => navigate('/market')}
          >
            MARKET
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className={`profile-section ${isProfileOpen ? 'open' : ''}`}>
          <button 
            className="profile-button"
            onClick={toggleProfile}
          >
            <div className="profile-avatar">
              {photoURL ? (
                <img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <span>{displayName}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          <div className="profile-dropdown">
            <button 
              className="dropdown-item"
              onClick={() => navigate('/profile')}
            >
              <span></span>
              <span>My Profile</span>
            </button>
            
            <button 
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <span></span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
