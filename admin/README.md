# FineForm Admin Application

This is the **Next.js** admin web application for FineForm, built with **React** and **TypeScript**.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack Query)
- **Backend**: Express.js API with PostgreSQL database

## Getting Started

### Prerequisites

- Node.js 18+
- The API server must be running (see `/api/README.md`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

## Features

- Staff authentication with JWT tokens
- Dashboard for managing tax entities and workflows
- Entity management
- Document management
- Message threads
- Permission management (super admin, admin, staff)

## Project Structure

```
admin/
├── app/              # Next.js App Router pages
│   ├── login/       # Login page
│   └── dashboard/   # Dashboard page
├── lib/             # Utilities and API client
│   └── api/         # API client configuration
└── components/      # React components
```

## API Integration

The admin app connects to the Express.js API server running on port 3001 (configurable via `NEXT_PUBLIC_API_URL`).

Authentication tokens are stored in `localStorage` and automatically included in API requests.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
