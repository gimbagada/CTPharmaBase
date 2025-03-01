# CTPharmaLink NG - Project Structure

## Project Overview
A comprehensive pharmaceutical management platform with web and mobile interfaces.

## Tech Stack
- Frontend: React + TypeScript + Shadcn UI
- Mobile: React Native
- Backend: Express + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js

## Directory Structure

```
├── client/                      # Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # Dashboard Components
│   │   │   │   ├── inventory.tsx
│   │   │   │   ├── pharmacy-finder.tsx
│   │   │   │   ├── voice-reminder.tsx
│   │   │   │   ├── insurance-claims.tsx
│   │   │   │   └── medication-verification.tsx
│   │   │   └── ui/            # UI Components
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   └── auth-page.tsx
│   │   └── hooks/
│   │       └── use-auth.tsx
├── mobile/                      # Mobile Application
│   ├── screens/
│   │   ├── InventoryScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── LoginScreen.tsx
│   └── components/
├── server/                      # Backend Server
│   ├── routes.ts
│   ├── storage.ts
│   ├── auth.ts
│   └── db.ts
└── shared/                      # Shared Types/Schema
    └── schema.ts
```

## Required Environment Variables
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
```

## Database Schema
The application uses the following tables:
- users
- medications
- pharmacies
- inventory
- insurance_providers
- insurance_claims
- medication_reminders

## Key Features Implemented
1. Pharmacy Location System
2. Real-time Inventory Management
3. Medication Verification
4. Voice-enabled Medication Reminders
5. Insurance Claims Processing

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Initialize database:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Mobile App Setup
1. Navigate to mobile directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React Native development server:
   ```bash
   npm start
   ```
