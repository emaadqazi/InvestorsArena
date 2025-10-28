import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Profile = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      
      <div className="main-content">
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '20px', 
          padding: '40px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            color: '#333', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            👤 My Profile
          </h1>
          
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
            View and edit your profile information, investment statistics, and portfolio performance.
          </p>

          <div style={{ 
            background: '#f8f9fa', 
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
