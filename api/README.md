# FineForm API Server

This is the **Express.js** API server for FineForm, using **PostgreSQL** as the database with **Prisma** as the ORM.

## Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (local)
- **ORM**: Prisma 6
- **Authentication**: JWT tokens (access + refresh)
- **File Storage**: Local filesystem
- **Validation**: Zod
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- Database `fineform` created with user `fineform` and password `fineform`

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://fineform:fineform@localhost:5432/fineform?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
PORT=3001
```

### Database Setup

1. Create the database and user in PostgreSQL:
```sql
CREATE DATABASE fineform;
CREATE USER fineform WITH PASSWORD 'fineform';
GRANT ALL PRIVILEGES ON DATABASE fineform TO fineform;
```

2. Sync the database schema:
```bash
npm run prisma:generate
npx prisma db push
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:3001` (or the port specified in `.env`).

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile (requires auth)

### Entities
- `GET /api/entities` - List all entities (staff only)
- `GET /api/entities/:id` - Get entity by ID (requires auth)

### Documents
- `POST /api/documents/upload` - Upload document (requires auth)
- `GET /api/documents/:id` - Get document metadata (requires auth)
- `GET /api/documents/:id/download` - Download document (requires auth)

### Messages
- `GET /api/messages/threads` - List message threads (requires auth)
- `GET /api/messages/threads/:threadId/messages` - Get messages for thread (requires auth)
- `POST /api/messages/threads/:threadId/messages` - Send message (requires auth)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (staff only)

## Creating Users

Create a user in the database:

```bash
npm run create-user <email> <password> "<full name>" <userType> <staffRole>
```

Examples:
- **Super Admin**: `npm run create-user admin@fineform.com admin123 "Admin User" STAFF SUPER_ADMIN`
- **Staff**: `npm run create-user staff@fineform.com password123 "Staff User" STAFF STAFF`
- **Client**: `npm run create-user client@fineform.com password123 "Client User" CLIENT`

## Database Management

### Prisma Studio

Open Prisma Studio to view and edit data:

```bash
npm run prisma:studio
```

### Migrations

Generate Prisma client:

```bash
npm run prisma:generate
```

Push schema changes to database:

```bash
npx prisma db push
```

## Project Structure

```
api/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── users.ts      # User routes
│   │   ├── entities.ts   # Entity routes
│   │   ├── documents.ts  # Document routes
│   │   ├── messages.ts   # Message routes
│   │   └── dashboard.ts  # Dashboard routes
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   └── errorHandler.ts # Error handling
│   ├── services/         # Business logic
│   ├── db/              # Prisma client
│   │   └── client.ts
│   ├── utils/           # Server utilities
│   └── server.ts        # Express app entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Local file storage
└── scripts/
    └── create-user.ts   # User creation script
```

## Authentication

The API uses JWT tokens for authentication:

- **Access Token**: Valid for 15 minutes, included in `Authorization: Bearer <token>` header
- **Refresh Token**: Valid for 7 days, used to get new access tokens

Clients should:
1. Store both tokens after login
2. Include access token in all authenticated requests
3. Use refresh token to get new access token when it expires
4. Redirect to login if refresh fails

## File Storage

Uploaded files are stored in the `api/uploads/` directory with the following structure:

```
uploads/
├── {client_entity_id}/
│   ├── {folder_id}/
│   │   └── {filename}
│   └── tax-returns/
│       └── {year}/
│           └── {filename}
```

## Learn More

- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

