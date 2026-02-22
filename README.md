# RecipeAI - Smart Recipe Management System

A full-stack recipe management application with an AI-powered chef assistant. Built with Next.js, Supabase, and dual LLM support (Groq / Google Gemini).

## Features

- **Recipe Management** — Create, edit, delete, and organize recipes with tags, difficulty levels, cuisine types, and status tracking (favorite, to try, made before)
- **AI Chef Assistant** — Conversational chat interface that generates recipes, suggests meals from available ingredients, finds ingredient substitutions, estimates nutrition, creates weekly meal plans, and enhances existing recipes
- **Community Sharing** — Publish recipes publicly, browse community recipes, and view other users' public profiles
- **Dashboard Analytics** — Visualize your recipe collection with charts for cuisine distribution and difficulty breakdown
- **Search & Filtering** — Filter recipes by cuisine, difficulty, and cook time across dashboard and explore pages
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Responsive** — Mobile-first design that works on all devices

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS 4, Lucide icons |
| Database | Supabase (PostgreSQL with Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI | Groq (Llama 3.3 70B Versatile) or Google Gemini (2.5 Flash Lite) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key and/or a [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd recipe-manager
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
AI_PROVIDER=groq
```

Set `AI_PROVIDER` to `groq` (default) or `gemini` to choose the LLM backend. You only need the API key for the provider you select.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/
├── (auth)/              # Login, signup, OAuth callback
├── dashboard/           # User's recipe collection + analytics
├── recipes/
│   ├── new/             # Create recipe
│   └── [id]/            # View / edit recipe
├── ai-chef/             # AI chat assistant
├── explore/             # Browse community recipes
├── shared/[username]/   # Public user profiles
├── profile/             # User settings
├── api/ai/              # AI chat API endpoint
└── page.tsx             # Landing page

components/
├── ui/                  # Reusable UI primitives (shadcn/ui pattern)
├── navbar.tsx           # Auth-aware navigation
├── ai-chat.tsx          # AI chat interface with session management
├── recipe-form.tsx      # Create/edit recipe form
├── recipe-card.tsx      # Recipe preview card
└── search-bar.tsx       # Search and filter controls

lib/
├── ai.ts                # AI provider abstraction (Groq + Gemini)
├── supabase/
│   ├── client.ts        # Browser Supabase client
│   ├── server.ts        # Server Supabase client
│   └── middleware.ts     # Auth session refresh + route protection
└── utils.ts             # Shared utilities (cn, formatTime, scaleIngredient)

supabase/
└── schema.sql           # Database schema, RLS policies, and triggers
```

## AI Capabilities

| Feature | Example Prompt |
|---|---|
| Recipe Generation | "Generate a recipe for Thai green curry" |
| Ingredient-Based Suggestions | "I have chicken, rice, and bell peppers" |
| Ingredient Substitution | "What can I use instead of coconut milk?" |
| Nutritional Estimation | "What's the nutrition info for this pasta?" |
| Meal Planning | "Plan meals for a vegetarian week" |
| Recipe Enhancement | "How can I improve this soup recipe?" |
| General Cooking Q&A | "What's the best way to sear a steak?" |

## Database

The schema (`supabase/schema.sql`) creates three tables:

- **profiles** — Extends Supabase `auth.users` with username, display name, avatar, bio, and public visibility. Auto-created on signup via a database trigger.
- **recipes** — Stores recipe data with JSONB columns for ingredients, instructions, and nutritional info. Supports public/private visibility and AI-generated flags.
- **chat_sessions** — Persists AI chat history per user.

All tables use Row Level Security. Users can only access their own data; public profiles and recipes are visible to everyone.
