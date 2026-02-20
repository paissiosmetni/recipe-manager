# RecipeAI - Smart Recipe Management System

A full-featured recipe management application built with Next.js, Supabase, and Google Gemini AI.

## Features

- **Recipe Management** — Create, edit, delete, and organize recipes with tags, status tracking, and categories
- **AI Chef Assistant** — Generate recipes, get ingredient substitutions, estimate nutrition, plan meals, and more via Google Gemini
- **Smart Search** — Filter recipes by cuisine, difficulty, cook time, status, and full-text search
- **Community Sharing** — Share recipes publicly, explore community recipes, and copy recipes to your collection
- **Dashboard Analytics** — Visualize your recipe collection with charts for cuisine distribution and difficulty breakdown
- **Cooking Tools** — Built-in timer, recipe scaling, nutritional info display, and print-friendly view
- **Auth** — Email/password and Google OAuth via Supabase Auth
- **Dark/Light Mode** — System-aware theme toggle
- **Responsive** — Mobile-first design that works on all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Google Gemini 2.0 Flash
- **Styling**: Tailwind CSS 4 + custom shadcn/ui-inspired components
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd recipe-manager
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. (Optional) Enable Google OAuth in Authentication > Providers
4. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the three environment variables in Vercel's project settings
4. Deploy

## Project Structure

```
recipe-manager/
├── app/
│   ├── (auth)/          — Login, signup, OAuth callback
│   ├── dashboard/       — User's recipe dashboard with analytics
│   ├── recipes/         — CRUD: new, view, edit
│   ├── explore/         — Browse public community recipes
│   ├── ai-chef/         — AI chat assistant
│   ├── profile/         — User profile settings
│   ├── shared/          — Public user profiles
│   ├── api/ai/          — Gemini AI API route
│   ├── layout.tsx       — Root layout with navbar + theme
│   └── page.tsx         — Landing page
├── components/
│   ├── ui/              — Reusable UI components (button, card, etc.)
│   ├── navbar.tsx       — Navigation bar
│   ├── recipe-card.tsx  — Recipe card component
│   ├── recipe-form.tsx  — Create/edit recipe form
│   ├── search-bar.tsx   — Search + filter controls
│   └── ai-chat.tsx      — AI chat interface
├── lib/
│   ├── supabase/        — Supabase client/server/middleware helpers
│   ├── gemini.ts        — Gemini AI configuration and prompts
│   └── utils.ts         — Utility functions
└── supabase/
    └── schema.sql       — Database schema
```

## AI Features

| Feature | Description |
|---------|-------------|
| Recipe Generator | "Generate a recipe for Italian pasta with chicken" |
| What Can I Cook? | Input ingredients → get recipe suggestions |
| Ingredient Substitution | "What can I substitute for butter?" |
| Nutritional Estimation | Estimate calories, protein, carbs, fat |
| Meal Planner | Generate a weekly meal plan |
| Recipe Enhancement | Get improvement suggestions for existing recipes |
