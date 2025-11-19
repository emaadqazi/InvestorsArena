import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Leagues = () => {
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
            fontSize: '38px', 
            color: '#e3f2fd',
            fontWeight: '800',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            letterSpacing: '2px',
            textShadow: '0 2px 10px rgba(25, 118, 210, 0.3)'
          }}>
            LEAGUES
          </h1>
          
          <p style={{ color: '#b3d9ff', fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
            Create and join investment leagues to compete with friends and other investors.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            {/* Create League Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0a1929, #1976d2)', 
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
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)', 
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
              background: '#90caf9', 
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
