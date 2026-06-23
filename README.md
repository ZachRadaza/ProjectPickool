# Project Pickool

Project Pickool is a web app for discovering, joining, and managing pickleball clubs and events. Users can browse clubs, find nearby events, manage their profile, and interact with club/event membership features.

## Features

- User authentication with Supabase
- User profiles with location and profile details
- Browse and search clubs and events
- Location-based “near me” search
- Club membership and requests
- Event discovery based on nearby events and user clubs
- Notifications for club and event activity
- Ability to post on clubs
- Ability to real time message in club
- Responsive React UI

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Supabase
- Mapbox Search JS
- CSS

## Getting Started

### Prerequisites

Make sure you have Node.js installed.

### Installation

```bash
git clone https://github.com/ZachRadaza/ProjectPickool.git
cd ProjectPickool
npm install
```

### Environment Variables

Create a .env file in the root directory and add your Supabase and Mapbox configuration.

Example:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Run the App

```bash
npm run dev
```

### Build For Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

As of May 23, 2026

```bash
src/
├── assets/
├── components/
│   ├── layout/
│   ├── clubs/
│   ├── events/
│   ├── posts/
│   ├── user/
│   └── ui/
├── layouts/
├── pages/
│   ├── Clubs.tsx
│   ├── Events.tsx
│   ├── Home.tsx
│   ├── Search.tsx
│   └── User.tsx
├── popups/
│   ├── clubs
│   ├── events
│   ├── general
│   ├── home
│   ├── notifications
│   ├── posts
│   └── user
├── utils/
│   ├── extension-service/
│   ├── ExtensionService.ts
│   ├── schemas.ts
│   └── supabase.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Author

Created By [Zach Radaza](https://zach-radaza.com)