import React from 'react';
import Navigation from '../common/Navigation';
import '../../styles/navigation.css';

const Stocks = () => {
  // Mock stock data for demonstration
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$175.43', change: '+2.34%', changeColor: '#27ae60' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$142.56', change: '-1.22%', changeColor: '#e74c3c' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$378.85', change: '+0.87%', changeColor: '#27ae60' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.98', change: '+3.45%', changeColor: '#27ae60' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$155.89', change: '-0.56%', changeColor: '#e74c3c' }
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
            STOCKS
          </h1>
          
          <p style={{ color: '#b3d9ff', fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
            Browse, analyze, and track stocks for your investment portfolio.
          </p>

          {/* Search and Filter Section */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <input 
              type="text" 
              placeholder="Search stocks (e.g., AAPL, Tesla, Microsoft)"
              style={{
                flex: 1,
                padding: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                minWidth: '300px'
              }}
            />
            <button style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #1565c0, #1976d2, #42a5f5)'}
            onMouseLeave={(e) => e.target.style.background = '#1976d2'}>
              Search
            </button>
            <select style={{
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '16px',
              background: '#bbdefb'
            }}>
              <option>All Sectors</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Energy</option>
            </select>
          </div>

          {/* Stock List */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              Popular Stocks
            </h2>
            
            <div style={{ background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.08) 100%)', border: '1px solid rgba(25, 118, 210, 0.3)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)' }}>
              {/* Table Header */}
              <div style={{ 
                background: '#90caf9', 
                padding: '20px', 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                fontWeight: 'bold',
                color: '#333',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div>Symbol</div>
                <div>Company Name</div>
                <div>Price</div>
                <div>Change</div>
                <div>Action</div>
              </div>

              {/* Stock Rows */}
              {mockStocks.map((stock, index) => (
                <div 
                  key={stock.symbol}
                  style={{ 
                    padding: '20px', 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    borderBottom: index < mockStocks.length - 1 ? '1px solid #f1f3f4' : 'none',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#90caf9'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{stock.symbol}</div>
                  <div style={{ color: '#666' }}>{stock.name}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{stock.price}</div>
                  <div style={{ color: stock.changeColor, fontWeight: 'bold' }}>{stock.change}</div>
                  <div>
                    <button style={{
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #1565c0, #1976d2, #42a5f5)'}
                    onMouseLeave={(e) => e.target.style.background = '#1976d2'}>
                      Add to Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Watchlist */}
          <div>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
              My Watchlist
            </h2>
            
            <div style={{ 
              background: '#90caf9', 
              borderRadius: '10px', 
              padding: '40px', 
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}></div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>No Stocks in Watchlist</h3>
              <p style={{ color: '#888' }}>
                Start adding stocks to your watchlist to track their performance!
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeaa7' }}>
            <h4 style={{ color: '#856404', marginBottom: '10px' }}>FUTURE SPRINTS:</h4>
            <ul style={{ color: '#856404', paddingLeft: '20px' }}>
              <li>Real-time stock prices via Alpha Vantage API/Yahoo Finance</li>
              <li>Interactive stock charts and technical indicators</li>
              <li>Portfolio performance tracking</li>
              <li>Stock news and analysis</li>
              <li>Advanced filtering and screening tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
