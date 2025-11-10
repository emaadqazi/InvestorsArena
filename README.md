# Investors Arena - Fantasy Stock Trading League

A platform where users can create and join fantasy stock trading leagues with friends. Trade stocks with virtual budgets and compete for the best portfolio performance.

## Features

- 🔐 User authentication with email verification
- 👥 Create and join leagues with invitation codes
- 💰 Virtual budget management by league admins
- 📈 Buy and sell stocks in real-time
- 📊 Portfolio dashboard with performance metrics
- 🏆 Leaderboard for league competitions

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: JWT with email verification
- **Stock Data**: Yahoo Finance API (via yahoo-finance2 package)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup

1. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Set up environment variables:
```bash
cd backend
# Create .env file with your configuration
# See SETUP.md for required variables
```

3. Set up the database:
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

4. Run the development servers:
```bash
# From root directory
npm run dev
```

The backend will run on `http://localhost:3001` and frontend on `http://localhost:3000`.

**Important**: You'll need:
- PostgreSQL database
- Email SMTP credentials for email verification (optional for development)
- Yahoo Finance API (no API key required - uses yahoo-finance2 package)

## Project Structure

```
├── backend/          # Express API server
├── frontend/         # React application
└── README.md
```

