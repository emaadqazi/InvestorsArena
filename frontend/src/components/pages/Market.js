import React, { useState, useEffect } from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Market = () => {
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, currentTime: '' });

  // Check if market is open (9:30 AM - 4:00 PM EST, Monday-Friday)
  useEffect(() => {
    const checkMarketStatus = () => {
      // Get current time in EST
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      
      const day = estTime.getDay(); // 0 = Sunday, 6 = Saturday
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      
      // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
      const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
      const marketClose = 16 * 60; // 4:00 PM in minutes
      
      // Check if it's a weekday (Monday = 1, Friday = 5) and within market hours
      const isWeekday = day >= 1 && day <= 5;
      const isDuringMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;
      const isOpen = isWeekday && isDuringMarketHours;
      
      // Format current time for display
      const timeString = estTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      setMarketStatus({ isOpen, currentTime: timeString });
    };
    
    // Check immediately and then every minute
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Mock market data for demonstration
  const marketIndices = [
    { name: 'S&P 500', symbol: 'SPX', value: '4,373.20', change: '+0.65%', changeColor: '#27ae60' },
    { name: 'Dow Jones', symbol: 'DJI', value: '33,947.10', change: '+0.43%', changeColor: '#27ae60' },
    { name: 'NASDAQ', symbol: 'IXIC', value: '13,761.53', change: '+0.89%', changeColor: '#27ae60' },
    { name: 'Russell 2000', symbol: 'RUT', value: '1,879.23', change: '-0.12%', changeColor: '#e74c3c' }
  ];

  const topMovers = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', change: '+8.45%', changeColor: '#27ae60' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', change: '+5.67%', changeColor: '#27ae60' },
    { symbol: 'META', name: 'Meta Platforms', change: '+4.32%', changeColor: '#27ae60' },
    { symbol: 'NFLX', name: 'Netflix Inc', change: '-3.21%', changeColor: '#e74c3c' },
    { symbol: 'PYPL', name: 'PayPal Holdings', change: '-2.87%', changeColor: '#e74c3c' }
  ];

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
            MARKET OVERVIEW
          </h1>
          
          <p style={{ color: '#b3d9ff', fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
            Stay updated with real-time market data, indices, and trending stocks.
          </p>

          {/* Market Status */}
          <div style={{ 
            background: marketStatus.isOpen 
              ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
              : 'linear-gradient(135deg, #e74c3c, #c0392b)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '2px solid rgba(25, 118, 210, 0.3)',
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.2), 0 0 0 1px rgba(66, 165, 245, 0.1) inset'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                {marketStatus.isOpen ? '🟢' : '🔴'} Market Status
              </h3>
              <p style={{ opacity: 0.9, margin: 0 }}>
                {marketStatus.isOpen ? 'Markets are currently open' : 'Market is closed'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Eastern Time</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {marketStatus.currentTime || 'Loading...'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                Market Hours: 9:30 AM - 4:00 PM
              </div>
            </div>
          </div>

          {/* Market Indices */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              Major Indices
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {marketIndices.map((index) => (
                <div 
                  key={index.symbol}
                  style={{ 
                    background: '#bbdefb',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f3f4'
                  }}
                >
                  <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '16px' }}>{index.name}</h3>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{index.symbol}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                    {index.value}
                  </div>
                  <div style={{ color: index.changeColor, fontWeight: 'bold', fontSize: '16px' }}>
                    {index.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Movers */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              Top Movers
            </h2>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.08) 100%)', border: '1px solid rgba(25, 118, 210, 0.3)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)' }}>
              {/* Table Header */}
              <div style={{ 
                background: '#90caf9', 
                padding: '20px', 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr 1fr',
                fontWeight: 'bold',
                color: '#333',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div>Symbol</div>
                <div>Company Name</div>
                <div>Change</div>
              </div>

              {/* Mover Rows */}
              {topMovers.map((mover, index) => (
                <div 
                  key={mover.symbol}
                  style={{ 
                    padding: '20px', 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr 1fr',
                    alignItems: 'center',
                    borderBottom: index < topMovers.length - 1 ? '1px solid #f1f3f4' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{mover.symbol}</div>
                  <div style={{ color: '#666' }}>{mover.name}</div>
                  <div style={{ color: mover.changeColor, fontWeight: 'bold', fontSize: '16px' }}>
                    {mover.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market News Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              Market News
            </h2>
            
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '40px', 
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📰</div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Market News Coming Soon</h3>
              <p style={{ color: '#888' }}>
                Stay tuned for real-time financial news and market analysis!
              </p>
            </div>
          </div>

          {/* Market Calendar */}
          <div>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              Market Calendar
            </h2>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.08) 100%)', border: '1px solid rgba(25, 118, 210, 0.3)', borderRadius: '18px', padding: '30px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>Today</h4>
                  <p style={{ color: '#666', margin: 0 }}>No major events scheduled</p>
                </div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>This Week</h4>
                  <p style={{ color: '#666', margin: 0 }}>Fed Interest Rate Decision (Wed)</p>
                </div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>Earnings</h4>
                  <p style={{ color: '#666', margin: 0 }}>AAPL, GOOGL, MSFT (Coming)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeaa7' }}>
            <h4 style={{ color: '#856404', marginBottom: '10px' }}>FUTURE SPRINTS:</h4>
            <ul style={{ color: '#856404', paddingLeft: '20px' }}>
              <li>Real-time market data and live charts</li>
              <li>Economic calendar with events and announcements</li>
              <li>Market sentiment analysis and indicators</li>
              <li>Sector performance breakdowns</li>
              <li>International markets and forex data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
