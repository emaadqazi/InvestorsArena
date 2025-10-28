import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Dashboard = () => {
  // Create letter-by-letter reveal effect
  const createLetterReveal = (text) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="letter-reveal"
        style={{
          animationDelay: `${index * 0.08}s`,
          marginRight: char === ' ' ? '0.3em' : '0',
          display: 'inline-block',
          background: 'linear-gradient(135deg, #8e44ad, #e91e63, #ff9800)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

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
            fontSize: '36px', 
            fontWeight: 'bold',
            marginBottom: '40px',
            textAlign: 'center',
            letterSpacing: '2px',
            minHeight: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {createLetterReveal('WELCOME TO INVESTORS ARENA')}
          </h1>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            
            {/* Leagues Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #8e44ad, #e91e63)', 
              borderRadius: '15px', 
              padding: '30px', 
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/leagues'}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                LEAGUES
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.9, lineHeight: '1.5' }}>
                Create private investment competitions with friends. Draft stocks, compete in real-time, and climb the leaderboards.
              </p>
            </div>

            {/* Stocks Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #e91e63, #ff9800)', 
              borderRadius: '15px', 
              padding: '30px', 
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/stocks'}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                STOCKS
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.9, lineHeight: '1.5' }}>
                Browse and research stocks with real-time data. Build your virtual portfolio and track performance against the market.
              </p>
            </div>

            {/* Market Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #ff9800, #f39c12)', 
              borderRadius: '15px', 
              padding: '30px', 
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/market'}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                MARKET
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.9, lineHeight: '1.5' }}>
                Monitor live market indices, track top movers, and stay informed with financial news and economic indicators.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
