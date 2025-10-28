// Protected Route component for InvestorsArena
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/loading.css'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h3 className="loading-title">Loading InvestorsArena...</h3>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render protected content if authenticated
  return children
}

export default ProtectedRoute
