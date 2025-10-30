// Firebase configuration for InvestorsArena
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here' || firebaseConfig.apiKey === 'demo-api-key') {
  console.error('🔥 Firebase API key is not configured!');
  console.error('📁 Please add Firebase credentials to your .env file');
}

// Initialize Firebase with fallback
let app, auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.error('Please check your Firebase configuration in .env file');
  // Don't export undefined - throw error so we know immediately
  throw new Error('Firebase failed to initialize. Check your .env configuration.');
}

export { auth };
export default app;
