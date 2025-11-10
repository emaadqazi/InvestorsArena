import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/navigation.css';

const Navigation = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setIsProfileOpen(false); // Close dropdown
    console.log('Demo logout - redirecting to login');
    navigate('/login'); // Redirect to login to show complete auth flow
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
              
            </div>
            <span>TEST USER</span>
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
