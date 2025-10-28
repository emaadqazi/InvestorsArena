// Basic Express server for Investors Arena
// This will be expanded with Firebase auth in the next steps

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to make requests
app.use(express.json()); // Parse JSON request bodies

// Test route to verify server is working
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Investors Arena Backend is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test protected route (we'll add Firebase auth here later)
app.get('/api/protected', (req, res) => {
  res.json({ 
    message: 'This will be protected by Firebase JWT soon!',
    data: 'Sample user portfolio data would go here'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Investors Arena Backend - Sprint 01`);
  console.log(`🔥 Firebase integration coming next!`);
});
