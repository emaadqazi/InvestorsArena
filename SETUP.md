# Setup Guide for Investors Arena

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up Database

1. Create a PostgreSQL database:
```bash
createdb investors_arena
```

2. Configure environment variables in `backend/.env`:
```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/investors_arena?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email configuration (for verification)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"

PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Note: Yahoo Finance API is used for stock data (no API key required)
```

3. Run database migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Step 3: Configure Services

### Stock Data (Yahoo Finance)
- No API key required! The app uses the `yahoo-finance2` package which provides free access to Yahoo Finance data
- No rate limits or daily quotas to worry about

### Email Configuration (for email verification)
For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASS`

For other email providers, update the SMTP settings accordingly.

## Step 4: Run the Application

### Development Mode

From the root directory:
```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 3000) servers.

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

## Step 5: Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Create a new account"
3. Fill in your details
4. Check your email for verification link
5. Verify your email
6. Login and start creating leagues!

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify database credentials

### Email Verification Not Working
- Check your email SMTP settings
- For Gmail, ensure you're using an App Password, not your regular password
- Check spam folder for verification emails

### Stock Data Not Loading
- Ensure you have internet connection
- Yahoo Finance API should work without any API keys
- If issues persist, check your internet connection and firewall settings

### Port Already in Use
- Change PORT in `backend/.env` for backend
- Change port in `frontend/vite.config.ts` for frontend

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the frontend: `cd frontend && npm run build`
3. Build the backend: `cd backend && npm run build`
4. Use a process manager like PM2 for the backend
5. Serve the frontend build with a web server like Nginx
6. Use environment variables for all sensitive data
7. Set up SSL/HTTPS
8. Configure CORS properly for your domain

## Database Management

### View database in Prisma Studio
```bash
cd backend
npx prisma studio
```

### Reset database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

### Create a new migration
```bash
cd backend
npx prisma migrate dev --name migration-name
```

