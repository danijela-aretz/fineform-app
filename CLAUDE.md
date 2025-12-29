# FineForm App - Project Structure

## Overview
FineForm App is a full-stack application consisting of:
- **API**: Express.js backend with **PostgreSQL** database
- **Admin**: **Next.js** web application (built with **React**) for administrative management
- **Client**: **React Native** mobile application for end users

All applications share a common **PostgreSQL** database and Express API backend. The frontend applications use **React** (Next.js for web) and **React Native** (Expo for mobile).

## Project Structure

```
fineform-app/
├── api/                       # Express.js API Server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── services/          # Business logic
│   │   ├── db/                # Prisma client
│   │   └── utils/             # Server utilities
│   ├── prisma/                # Prisma schema & migrations
│   │   └── schema.prisma
│   ├── uploads/               # Local file storage
│   ├── .env                   # Database connection, JWT secret
│   ├── package.json
│   └── server.ts
│
├── shared/                     # Shared TypeScript code
│   ├── src/
│   │   ├── types/             # TypeScript interfaces/types
│   │   ├── constants/          # Enums, status definitions
│   │   └── utils/              # Shared utility functions
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                     # Next.js Admin Web App
│   ├── app/                   # Next.js App Router
│   ├── lib/                   # Admin utilities, API client
│   ├── .env.local             # API URL
│   ├── package.json
│   └── next.config.js
│
└── client/                     # React Native Mobile App
    ├── src/
    │   ├── screens/            # App screens
    │   ├── components/         # React Native components
    │   ├── api/                # API client
    │   └── navigation/         # Navigation setup
    ├── package.json
    └── app.json
```

## Technology Stack

### API Server
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (local database, not Supabase)
- **ORM**: Prisma 6
- **Authentication**: JWT tokens (access + refresh)
- **File Storage**: Local filesystem
- **Validation**: Zod
- **Language**: TypeScript

### Admin Application
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Backend**: Express.js API with PostgreSQL database

### Client Application
- **Framework**: React Native (Expo)
- **UI Library**: React Native
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Backend**: Express.js API with PostgreSQL database

### Shared Package
- **Language**: TypeScript
- **Purpose**: Shared types, constants, and utilities

## Database Configuration
- **Database**: `fineform`
- **User**: `fineform`
- **Password**: `fineform`
- **Host**: `localhost`
- **Port**: `5432`

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running
- Database `fineform` created with user `fineform`

### API Server
```bash
cd api
npm install
# Create .env file with DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT
npm run dev          # Runs with tsx watch
npm run build        # Builds TypeScript
npm start            # Runs production build
```

### Admin Application
```bash
cd admin
npm install
# Create .env.local with NEXT_PUBLIC_API_URL
npm run dev          # Runs Next.js dev server
npm run build        # Builds for production
npm start            # Runs production build
```

### Client Application
```bash
cd client
npm install
# Create .env with EXPO_PUBLIC_API_URL
npm start            # Starts Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
```

### Shared Package
```bash
cd shared
npm install
npm run build        # Builds TypeScript
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile

### Entities
- `GET /api/entities` - List all entities (staff only)
- `GET /api/entities/:id` - Get entity by ID

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document metadata
- `GET /api/documents/:id/download` - Download document

### Messages
- `GET /api/messages/threads` - List message threads
- `GET /api/messages/threads/:threadId/messages` - Get messages for thread
- `POST /api/messages/threads/:threadId/messages` - Send message

### Dashboard
- `GET /api/dashboard` - Get dashboard data (staff only)

## Authentication Flow

1. User logs in via `/api/auth/login` with email/password
2. Server validates credentials and returns JWT access token + refresh token
3. Client stores tokens (Next.js: localStorage, React Native: AsyncStorage)
4. Client includes JWT in `Authorization: Bearer <token>` header for protected routes
5. Server validates JWT on protected routes
6. On token expiry, client uses refresh token to get new access token

## Database Schema

The database schema includes:
- Users & Authentication
- Profiles & Staff Profiles
- Accounts & Client Entities
- Entity Tax Years (core container)
- Permissions (ACL, tax access, assignments)
- Folders & Documents
- Checklist & Questionnaire
- Messages & Threads
- Audit Logs
- Reminder State

See `api/prisma/schema.prisma` for complete schema definition.

## Notes
- The API server uses **PostgreSQL** (local database) with Prisma ORM for database access
- **React** is used for the admin web application (via Next.js)
- **React Native** is used for the client mobile application (via Expo)
- JWT tokens are used for authentication (15min access, 7day refresh)
- File uploads are stored in `api/uploads/` directory
- Both admin (React/Next.js) and client (React Native) apps share the same API endpoints
- The shared package provides common TypeScript types and utilities
- No Supabase dependencies - all backend functionality is custom-built with Express.js and PostgreSQL
