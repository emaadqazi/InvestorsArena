// Basic Express server for Investors Arena
// Firebase authentication implemented

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to make requests
app.use(express.json()); // Parse JSON request bodies

// Firebase auth middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Test route to verify server is working
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Investors Arena Backend is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Protected route with Firebase authentication
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Protected route accessed successfully!',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || 'Unknown'
    },
    data: 'Sample user portfolio data would go here'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Investors Arena Backend - Sprint 01`);
  console.log(`🔥 Firebase integration coming next!`);
});
