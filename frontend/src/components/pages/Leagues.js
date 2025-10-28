import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Leagues = () => {
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
            LEAGUES
          </h1>
          
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
            Create and join investment leagues to compete with friends and other investors.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            {/* Create League Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #8e44ad, #e91e63)', 
              borderRadius: '15px', 
              padding: '30px', 
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Create New League</h3>
              <p style={{ marginBottom: '20px', opacity: 0.9 }}>Start your own investment competition</p>
              <button style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                + Create League
              </button>
            </div>

            {/* Join League Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #e91e63, #ff9800)', 
              borderRadius: '15px', 
              padding: '30px', 
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Join League</h3>
              <p style={{ marginBottom: '20px', opacity: 0.9 }}>Enter a league code to join existing competition</p>
              <button style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Join with Code
              </button>
            </div>
          </div>

          {/* My Leagues Section */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              My Leagues
            </h2>
            
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '40px', 
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}></div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>No Leagues Yet</h3>
              <p style={{ color: '#888' }}>
                Create or join your first league to start competing with other investors!
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeaa7' }}>
            <h4 style={{ color: '#856404', marginBottom: '10px' }}>FUTURE SPRINTS:</h4>
            <ul style={{ color: '#856404', paddingLeft: '20px' }}>
              <li>Draft-style stock selection</li>
              <li>Real-time leaderboards</li>
              <li>Custom league rules and settings</li>
              <li>League chat and social features</li>
              <li>Performance analytics and insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leagues;
