# FineForm Admin Mock App

A standalone React mock application showcasing the proposed navigation structure and UI design for the FineForm admin application. This mock app uses design inspiration from [Fin Group LLC](https://www.fingroupllc.com/) and demonstrates the complete navigation structure without requiring a backend.

## Features

- **Complete Navigation Structure**: All proposed navigation items with role-based visibility
- **Mock Data**: Sample data for entities, clients, messages, notices, and action items
- **Responsive Design**: Clean, professional design inspired by Fin Group LLC
- **Role-Based UI**: Navigation adapts based on user role (super_admin, admin, staff)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd admin-mock
npm install
```

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Navigation Structure

The mock app demonstrates the following navigation structure:

### Always Visible
- **Dashboard**: Internal operational view of all tax returns

### System Management (Super Admin & Admin)
- **Clients**: Client list and search
- **Accounts**: Account CRUD operations
- **Entities**: Entity CRUD operations
- **Users & Staff**: User and staff management (Super Admin only)

### Tax Operations (Admin & Assistant)
- **Tax Season Start**: Workflow 1 - Invite queue management
- **Checklist Control**: Workflow 3 - Checklist management
- **Questionnaire Builder**: Questionnaire CRUD (Super Admin & Admin)
- **Tax Returns**: Client Copy management
- **Extensions**: Extension management

### Communication (Admin & Assistant)
- **Messages**: Workflow 8 - Client communication threads
- **Action Needed**: Action Needed dashboard with badges

### Notices (Admin & Assistant)
- **Tax Notices**: IRS and State Tax Notices management

### Settings (Super Admin)
- **Permissions**: Permission management

## Design

The design is inspired by Fin Group LLC's clean, professional aesthetic:
- Primary color: Blue (#0ea5e9 / primary-600)
- Clean white cards with subtle shadows
- Professional typography
- Clear visual hierarchy
- Responsive layout

## Mock Data

The app includes mock data for:
- User profiles with different roles
- Client accounts and entities
- Tax return statuses
- Action needed items
- Message threads
- Tax notices

## Technology Stack

- **React 18+**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **React Router**: Navigation

## Notes

This is a **mock application** for visualization purposes only. It does not:
- Connect to any backend
- Persist data
- Handle authentication
- Include all features from the plan

It serves as a visual reference for the proposed navigation structure and UI design.
