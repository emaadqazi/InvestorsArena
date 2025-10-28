import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/navigation.css';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const headers = [
    { path: '/leagues', label: 'Leagues', icon: '🏆' },
    { path: '/stocks', label: 'Stocks', icon: '📈' },
    { path: '/market', label: 'Market', icon: '💹' }
  ];

  return (
    <div className="dashboard-headers">
      {headers.map((header) => (
        <div
          key={header.path}
          className={`dashboard-header ${location.pathname === header.path ? 'active' : ''}`}
          onClick={() => navigate(header.path)}
          role="button"
          tabIndex={0}
        >
          <span style={{ marginRight: '8px' }}>{header.icon}</span>
          {header.label}
        </div>
      ))}
    </div>
  );
};

export default DashboardHeader;
