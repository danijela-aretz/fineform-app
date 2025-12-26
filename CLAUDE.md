# FineForm App - Project Structure

## Overview
FineForm App is a full-stack application consisting of two main applications that share a common Supabase backend:
- **Admin**: Node.js web application for administrative management
- **Client**: Flutter mobile application for end users

Both applications connect to the same Supabase project for data persistence, authentication, and real-time features.

## Project Structure

```
fineform-app/
├── admin/                    # Admin web application
│   ├── src/                  # Vue.js source code
│   │   ├── App.vue          # Main Vue component
│   │   ├── main.js          # Application entry point
│   │   ├── components/      # Vue components
│   │   │   ├── Dashboard.vue
│   │   │   └── HelloWorld.vue
│   │   └── assets/          # Static assets
│   ├── public/              # Public static files
│   ├── server.js            # Express.js backend server
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite build configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── postcss.config.js    # PostCSS configuration
│
├── client/                  # Mobile application
│   ├── lib/                 # Dart source code
│   │   └── main.dart        # Flutter application entry point
│   ├── android/             # Android platform files
│   ├── ios/                 # iOS platform files
│   ├── web/                 # Web platform files
│   ├── windows/             # Windows platform files
│   ├── linux/               # Linux platform files
│   ├── macos/               # macOS platform files
│   ├── pubspec.yaml         # Flutter dependencies
│   └── analysis_options.yaml # Dart analysis configuration
│
└── CLAUDE.md                # This file - project documentation
```

## Technology Stack

### Admin Application
- **Frontend Framework**: Vue.js 3
- **UI Library**: PrimeVue 4.5.4
- **Styling**: Tailwind CSS 4.1.18
- **Build Tool**: Vite 7.2.4
- **Backend**: Express.js 5.2.1
- **Charts**: Chart.js 4.5.1
- **Icons**: PrimeIcons 7.0.0

### Client Application
- **Framework**: Flutter
- **Language**: Dart (SDK ^3.10.4)
- **Platforms**: Android, iOS, Web, Windows, Linux, macOS

### Shared Backend
- **Database & Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions, Storage)

## Development Setup

### Admin Application
```bash
cd admin
npm install
npm run dev          # Runs both server and client concurrently
npm run dev:server   # Runs Express server only
npm run dev:client   # Runs Vite dev server only
npm run build        # Build for production
```

### Client Application
```bash
cd client
flutter pub get
flutter run          # Run on connected device/emulator
```

## Supabase Integration

Both applications connect to the same Supabase project. Configuration and setup tasks are tracked in the Supabase integration todo list.

## Notes
- The admin app uses a dual-server setup: Express.js for backend API and Vite for frontend development
- The client app is a Flutter application supporting multiple platforms
- Both apps will share the same Supabase project for unified data management

