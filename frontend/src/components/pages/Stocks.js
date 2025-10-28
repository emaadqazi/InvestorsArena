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
            STOCKS
          </h1>
          
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
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
              background: 'linear-gradient(135deg, #8e44ad, #e91e63)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Search
            </button>
            <select style={{
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '16px',
              background: 'white'
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
            
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
              {/* Table Header */}
              <div style={{ 
                background: '#f8f9fa', 
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
                  onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{stock.symbol}</div>
                  <div style={{ color: '#666' }}>{stock.name}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{stock.price}</div>
                  <div style={{ color: stock.changeColor, fontWeight: 'bold' }}>{stock.change}</div>
                  <div>
                    <button style={{
                      background: 'linear-gradient(135deg, #8e44ad, #e91e63)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
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
              background: '#f8f9fa', 
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
