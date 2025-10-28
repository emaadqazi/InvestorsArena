import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/navigation.css';

const Navigation = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Clear user session/tokens when Firebase is integrated
    console.log('Logging out...');
    navigate('/login');
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

  // Mock user data - replace with real user data from auth context
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    initials: 'JD'
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div 
          className="navbar-logo"
          onClick={() => navigate('/dashboard')}
        >
          InvestorsArena
        </div>
      </div>

      <div className="navbar-right">
        <div className={`profile-section ${isProfileOpen ? 'open' : ''}`}>
          <button 
            className="profile-button"
            onClick={toggleProfile}
          >
            <div className="profile-avatar">
              {user.initials}
            </div>
            <span>{user.firstName}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          <div className="profile-dropdown">
            <button 
              className="dropdown-item"
              onClick={() => navigate('/account-settings')}
            >
              <span>⚙️</span>
              <span>Account Settings</span>
            </button>
            
            <button 
              className="dropdown-item"
              onClick={() => navigate('/profile')}
            >
              <span>👤</span>
              <span>My Profile</span>
            </button>
            
            <button 
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
