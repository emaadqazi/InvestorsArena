import React from 'react';
import '../../styles/auth.css';

const Dashboard = () => {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div className="logo">InvestorsArena</div>
          <h1 className="auth-title">Welcome to Your Portfolio!</h1>
          <p className="auth-subtitle">
            🎉 Authentication successful! You're now logged in.
          </p>
        </div>
        
        <div style={{ textAlign: 'left', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>🚀 What's Next?</h3>
          <ul style={{ color: '#666', lineHeight: '1.8' }}>
            <li>✅ <strong>Authentication UI:</strong> Complete!</li>
            <li>🔄 <strong>Firebase Integration:</strong> Coming next</li>
            <li>📊 <strong>Portfolio Dashboard:</strong> Sprint 01 scope</li>
            <li>💰 <strong>Stock Trading Features:</strong> Future sprints</li>
            <li>🏆 <strong>League System:</strong> Future sprints</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            className="auth-button"
            onClick={() => window.location.href = '/login'}
            style={{ width: '100%' }}
          >
            Back to Login (Demo)
          </button>
        </div>

        <div className="auth-link">
          <p style={{ fontSize: '14px', color: '#888' }}>
            This is a placeholder dashboard for Sprint 01 demo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
