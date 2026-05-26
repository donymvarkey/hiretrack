# HireTrack

A modern, minimal job application and interview tracking platform built with React 19, TypeScript, and Supabase.

## Tech Stack

- **React 19** + **Vite** — Fast development and builds
- **TypeScript** — Full type safety
- **Tailwind CSS** — Utility-first styling
- **Supabase** — Auth, database, and row-level security
- **TanStack Query** — Server state management
- **Zustand** — Client state management
- **React Hook Form** + **Zod** — Form handling and validation
- **Lucide React** — Icons
- **React Router** — Client-side routing

## Features

- Email/password authentication with persistent sessions
- Quick Add modal for fast HR call logging
- Full application CRUD with status tracking
- Interview timeline with round management
- Follow-up reminders with overdue detection
- Notes and activity tracking per application
- Search and filter across all applications
- Dashboard with stats overview
- Dark mode by default
- Mobile responsive

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
cd hiretrack
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── features/       # Feature-specific components
│   ├── layout/         # App layout (sidebar, header)
│   └── ui/             # Reusable UI primitives
├── lib/
│   ├── supabase.ts     # Supabase client
│   ├── utils.ts        # Utility functions
│   └── validations.ts  # Zod schemas
├── pages/
│   ├── auth/           # Login, signup, forgot password
│   ├── applications/   # List and detail views
│   ├── dashboard.tsx   # Dashboard overview
│   ├── follow-ups.tsx  # Follow-up management
│   └── settings.tsx    # Account settings
├── services/           # Supabase API layer
├── store/              # Zustand stores
├── types/              # TypeScript types
├── App.tsx             # Router and providers
└── main.tsx            # Entry point
```

## Database Schema

The Supabase schema includes:

- **applications** — Core job application data
- **interview_rounds** — Interview stages per application
- **notes** — Free-form notes per application
- **follow_ups** — Scheduled reminders and callbacks
- **activity_logs** — Audit trail

All tables have Row-Level Security (RLS) enabled so users can only access their own data.

## Application Statuses

- HR Called
- Applied
- Resume Shared
- Screening Round
- Technical Round 1 & 2
- Assignment Given
- Managerial Round
- HR Round
- Offer Received
- Rejected
- Joined
- On Hold

## License

MIT
