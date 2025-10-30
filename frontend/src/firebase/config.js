// Firebase configuration with fallback for development
let app = null;
let auth = null;

// Check if we have proper Firebase configuration
const isDemoConfig = !process.env.REACT_APP_FIREBASE_API_KEY || 
                     process.env.REACT_APP_FIREBASE_API_KEY === "your_api_key_here" ||
                     process.env.REACT_APP_FIREBASE_API_KEY === "demo-api-key";

if (!isDemoConfig) {
  // Only initialize Firebase if we have proper configuration
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Using demo mode. Please set up your Firebase project and update the .env file for authentication to work.');
}

// Export with fallbacks
export { auth };
export default app;
