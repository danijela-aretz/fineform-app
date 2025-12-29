# FineForm Client Application

This is the **React Native** mobile application for FineForm clients, built with **Expo** and **TypeScript**.

## Technology Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Backend**: Express.js API with PostgreSQL database

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (installed globally or via npx)
- The API server must be running (see `/api/README.md`)
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the Expo development server:

```bash
npm start
```

Then choose your platform:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

Or run directly:

```bash
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

## Features

- Client authentication with JWT tokens
- Entity selection and switching
- Tax year management
- Document upload and management
- Engagement letter signing
- Checklist completion
- Questionnaire submission
- In-app messaging
- Document downloads

## Project Structure

```
client/
├── src/
│   ├── screens/        # App screens
│   │   ├── LoginScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── components/     # React Native components
│   ├── api/            # API client
│   │   ├── client.ts   # Axios configuration
│   │   └── auth.ts     # Authentication API
│   └── navigation/     # Navigation setup
│       └── AppNavigator.tsx
└── App.tsx             # Root component
```

## API Integration

The client app connects to the Express.js API server running on port 3001 (configurable via `EXPO_PUBLIC_API_URL`).

Authentication tokens are stored in `AsyncStorage` and automatically included in API requests.

## Building for Production

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

## Learn More

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation Documentation](https://reactnavigation.org)

