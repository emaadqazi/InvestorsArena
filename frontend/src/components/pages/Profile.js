import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Profile = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      
      <div className="main-content">
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(30, 40, 55, 0.9) 0%, rgba(25, 45, 70, 0.85) 100%)', 
          borderRadius: '24px', 
          padding: '50px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(25, 118, 210, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(25, 118, 210, 0.3)'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            color: '#333', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            My Profile
          </h1>
          
          <p style={{ color: '#b3d9ff', fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
            View and edit your profile information, investment statistics, and portfolio performance.
          </p>

          <div style={{ 
              background: '#90caf9',
            borderRadius: '10px', 
            padding: '40px', 
            textAlign: 'center',
            border: '2px dashed #ddd'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Profile Page Coming Soon</h3>
            <p style={{ color: '#888' }}>
              User profile features will be available in future sprints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
