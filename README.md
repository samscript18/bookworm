# Bookworm

Bookworm is a full-stack social reading app. The mobile client lets readers discover public-domain books, save them to a personal library, read available book text, track reading progress, write reviews, comment on discussions, follow other readers, and receive notifications. The backend provides the authenticated REST API, user and book data models, review/comment workflows, image uploads, email-based password reset, Google authentication, push notification support, and Project Gutenberg/Gutendex book syncing.

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Backend Setup](#backend-setup)
- [Mobile Setup](#mobile-setup)
- [Common Scripts](#common-scripts)


## Project Structure

```text
bookworm/
├── backend/                 # Express, MongoDB, REST API, services, models
│   ├── src/
│   │   ├── config/          # Database, Cloudinary, email, Firebase setup
│   │   ├── controllers/     # Request handlers
│   │   ├── docs/            # Swagger documentation
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API route definitions
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── scripts/         # Seed script
│   │   ├── services/        # Business logic
│   │   └── templates/       # Email templates
│   └── package.json
└── mobile/                  # Expo React Native app
    ├── app/                 # Expo Router screens and layouts
    ├── components/          # Shared UI components
    ├── constants/           # Env, theme, storage keys
    ├── hooks/               # Shared hooks
    ├── lib/                 # API clients, services, config, utilities
    ├── store/               # Zustand stores
    ├── types/               # TypeScript types
    ├── app.json
    └── package.json
```

## Tech Stack

### Backend

- Node.js and Express 5
- TypeScript
- MongoDB with Mongoose
- Zod validation
- JWT authentication
- Google auth verification
- Cloudinary image uploads
- Nodemailer with Handlebars email templates
- Firebase Admin for push notifications
- Swagger UI at `/api/docs`
- Gutendex and Project Gutenberg integration

### Mobile

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- TanStack Query
- Zustand with Expo SecureStore persistence
- NativeWind/Tailwind styling
- Expo Notifications
- Google Sign-In
- Axios API clients

## Core Features

- Onboarding flow for first-time users.
- Email/password signup and login.
- Google authentication.
- Forgot password and reset password flow.
- Profile editing and reader preferences.
- Book discovery, search, genre filtering, and trending books.
- Public-domain book sync from Gutendex.
- Book details, reviews, discussions, and ratings.
- In-app book reader with reading progress tracking.
- Saved library split into Reading, To Read, and Completed.
- Review comments and reactions.
- User connections/follow-style reactions.
- Notifications and unread counts.
- Image upload support through Cloudinary.
- Light/dark theme persistence.

## Prerequisites

- Node.js
- npm
- MongoDB database URI
- Expo CLI access through `npx expo`
- Xcode/iOS Simulator for iOS development, or Android Studio for Android development
- Optional but recommended: EAS CLI for development builds and push notification testing

## Environment Variables

Create environment files locally. Do not commit real secrets.

### Backend `.env`

Place this in `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/bookworm
JWT_SECRET=replace-with-a-strong-secret
API_URL=http://localhost:4000

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

MAILER_USER=your-gmail-address
MAILER_PASS=your-gmail-app-password

GOOGLE_CLIENT_ID=your-google-web-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Mobile `.env.local`

Place this in `mobile/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
```

For local development, the mobile app rewrites localhost in development when Expo provides a host URI. This helps physical devices reach the backend over your LAN.

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

The API will run on the port defined by `PORT`, commonly:

```text
http://localhost:4000
```

Swagger documentation is available at:

```text
http://localhost:4000/api/docs
```

To build and run the compiled backend:

```bash
npm run build
npm start
```

To seed local data:

```bash
npm run seed
```

To append seed data without resetting:

```bash
npm run seed:append
```

## Mobile Setup

```bash
cd mobile
npm install
npm run start
```

Then choose a target from the Expo terminal UI.

For native builds:

```bash
npm run ios
npm run android
```

For web:

```bash
npm run web
```

The app bundle/package identifier is:

```text
com.samscript.bookworm
```

## Common Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the backend with `nodemon` and `tsx`. |
| `npm run build` | Compile TypeScript. |
| `npm start` | Run the compiled backend from `dist`. |
| `npm run seed` | Seed database data. |
| `npm run seed:append` | Append seed data without resetting. |

### Mobile

| Command | Description |
| --- | --- |
| `npm run start` | Start Expo. |
| `npm run ios` | Build/run the iOS app. |
| `npm run android` | Build/run the Android app. |
| `npm run lint` | Run Expo lint. |