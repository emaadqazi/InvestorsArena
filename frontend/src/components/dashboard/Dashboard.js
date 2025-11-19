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
          background: 'linear-gradient(135deg, #64b5f6, #42a5f5, #90caf9)',
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
          background: 'linear-gradient(145deg, rgba(26, 38, 56, 0.92) 0%, rgba(22, 42, 68, 0.88) 100%)', 
          borderRadius: '28px', 
          padding: '60px 70px',
          backdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.5), 0 10px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(25, 118, 210, 0.15)',
          border: '1.5px solid rgba(100, 181, 246, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(at 20% 10%, rgba(25, 118, 210, 0.03) 0%, transparent 50%), radial-gradient(at 80% 90%, rgba(66, 165, 245, 0.02) 0%, transparent 50%)'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700',
            marginBottom: '16px',
            textAlign: 'left',
            letterSpacing: '-0.5px',
            lineHeight: '1.1',
            color: '#ffffff',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Welcome back
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(227, 242, 253, 0.7)',
            marginBottom: '60px',
            textAlign: 'left',
            fontWeight: '400',
            letterSpacing: '0.2px'
          }}>
            Track your investments and compete with others
          </p>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            
            {/* Leagues Card */}
            <div style={{ 
              background: 'rgba(30, 45, 65, 0.4)',
              border: '1px solid rgba(100, 181, 246, 0.15)',
              borderRadius: '20px', 
              padding: '32px 28px', 
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(25, 118, 210, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(25, 118, 210, 0.25), 0 0 0 1px rgba(100, 181, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 45, 65, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
            onClick={() => window.location.href = '/leagues'}>
              <div style={{
                fontSize: '36px',
                marginBottom: '20px',
                opacity: 0.9
              }}>🏆</div>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                Leagues
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.75, lineHeight: '1.6', color: '#e3f2fd', fontSize: '14px', fontWeight: '400' }}>
                Compete with friends in private investment leagues
              </p>
            </div>

            {/* Stocks Card */}
            <div style={{ 
              background: 'rgba(30, 45, 65, 0.4)',
              border: '1px solid rgba(100, 181, 246, 0.15)',
              borderRadius: '20px', 
              padding: '32px 28px', 
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(25, 118, 210, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(25, 118, 210, 0.25), 0 0 0 1px rgba(100, 181, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 45, 65, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
            onClick={() => window.location.href = '/stocks'}>
              <div style={{
                fontSize: '36px',
                marginBottom: '20px',
                opacity: 0.9
              }}>📈</div>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                Stocks
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.75, lineHeight: '1.6', color: '#e3f2fd', fontSize: '14px', fontWeight: '400' }}>
                Browse stocks and build your virtual portfolio
              </p>
            </div>

            {/* Market Card */}
            <div style={{ 
              background: 'rgba(30, 45, 65, 0.4)',
              border: '1px solid rgba(100, 181, 246, 0.15)',
              borderRadius: '20px', 
              padding: '32px 28px', 
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(25, 118, 210, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.4)';
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(25, 118, 210, 0.25), 0 0 0 1px rgba(100, 181, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 45, 65, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
            onClick={() => window.location.href = '/market'}>
              <div style={{
                fontSize: '36px',
                marginBottom: '20px',
                opacity: 0.9
              }}>💹</div>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                Market
              </h3>
              <p style={{ marginBottom: '0', opacity: 0.75, lineHeight: '1.6', color: '#e3f2fd', fontSize: '14px', fontWeight: '400' }}>
                Track live indices and monitor market trends
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
