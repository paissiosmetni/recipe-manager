# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (uses Turbopack)
- **Build:** `npm run build`
- **Start production:** `npm run start`
- **Lint:** `npm run lint`

No test framework is configured.

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase project credentials
- `GROQ_API_KEY` - Groq API key (default AI provider)
- `GEMINI_API_KEY` - Google Gemini API key (alternative provider)
- `AI_PROVIDER` - Set to `groq` (default) or `gemini`

## Architecture

**Next.js 16 App Router** with React 19, TypeScript (strict mode), Tailwind CSS v4, and Supabase for database/auth.

### Routing & Auth

- **Route groups:** `app/(auth)/` contains login/signup/callback pages
- **Protected routes:** `/dashboard`, `/recipes/*`, `/ai-chef`, `/profile` — enforced in `lib/supabase/middleware.ts` which redirects unauthenticated users to `/login`
- **Auth pages** redirect authenticated users to `/dashboard`
- Root `middleware.ts` delegates to `lib/supabase/middleware.ts` for session refresh on every request

### Supabase Clients

Two Supabase client factories — use the correct one based on context:
- `lib/supabase/client.ts` — browser/client components (`createBrowserClient`)
- `lib/supabase/server.ts` — server components and API routes (`createServerClient` with cookie handling)

### Database

Schema defined in `supabase/schema.sql`. Three tables with Row Level Security:
- **profiles** — extends `auth.users`, auto-created via trigger on signup
- **recipes** — JSONB columns for `ingredients`, `instructions`, `nutritional_info`; `tags` is a text array; has `is_public` flag for community sharing
- **chat_sessions** — stores AI chat history as JSONB `messages`

### AI System

- **API route:** `app/api/ai/route.ts` — POST endpoint requiring auth, accepts `{ message, history }`
- **AI logic:** `lib/ai.ts` — dual provider support (Groq with `llama-3.3-70b-versatile`, Gemini with `gemini-2.5-flash-lite`)
- **Action detection:** The API route auto-detects action type from message keywords (generate_recipe, suggest_from_ingredients, substitute_ingredient, nutritional_info, meal_plan, enhance_recipe, general_chat)
- **Response parsing:** AI responses are expected as JSON; the route parses structured recipe data and formats it as markdown

### UI Components

Components in `components/ui/` follow shadcn/ui patterns using `class-variance-authority` for variants. The `cn()` utility from `lib/utils.ts` merges Tailwind classes. Theme is managed via `components/theme-provider.tsx` with dark/light mode support.

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).
