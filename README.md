# Investors Arena

A gamified investment platform that transforms stock market education into an engaging, competitive experience by combining fantasy sports mechanics with real-time financial data.

## 📋 Project Overview

Investors Arena enables users to create and participate in private leagues where they compete by building virtual portfolios using live market data. Unlike traditional paper trading platforms, we emphasize social competition through draft-style stock selection, real-time leaderboards, and customizable league rules.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/emaadqazi/InvestorsArena.git
   cd InvestorsArena
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Variables**
   - Create `frontend/.env` file with your API keys:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_SUPABASE_API_KEY=your_supabase_key
   REACT_APP_SUPABASE_PROJECT_URL=your_supabase_url
   REACT_APP_ALPHAVANTAGE_API_KEY=your_alphavantage_key
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

5. **Setup Backend** (Optional)
   ```bash
   cd ../backend
   npm install
   npm start
   ```

The application will be available at `http://localhost:3000`

