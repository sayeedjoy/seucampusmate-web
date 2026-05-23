# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint

npm run db:push                # Push Drizzle schema to the database (no migration files)
npm run db:studio              # Open Drizzle Studio
npm run seed:admin             # Seed an admin user (reads SEED_ADMIN_* env vars)
npm run seed:team              # Seed team_members table
npm run cleanup:chat-history   # Prune old chatbot conversations
```

There is no test suite configured. Scripts run via `tsx` (see `scripts/`).

## Environment Variables

Copy `.env.example` to `.env.local` and populate:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis caching layer
- `GOOGLE_SHEETS_CSV_URL` / `EXAMS_CSV_URL` — CSV data sources for course/exam data
- `NEXT_PUBLIC_ACADEMIC_CALENDAR_URL` / `NEXT_PUBLIC_BLOOD_DONORS_API_URL` — External APIs
- `NEXT_PUBLIC_MAP_STYLE_DARK` / `NEXT_PUBLIC_MAP_STYLE_LIGHT` — MapLibre GL tile styles
- `CP_USERNAMES_API_URL` / `CODEFORCES_API_BASE` — Codeforces leaderboard integration
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — Cloudinary uploads for `/about` team photos (admin)
- `DATABASE_URL` — Neon PostgreSQL connection string (required; `lib/db/index.ts` throws if unset)
- `AUTH_SECRET` / `AUTH_URL` — NextAuth v5 (admin auth). Generate the secret with `openssl rand -base64 32`
- `SUPERADMIN_EMAIL` — email granted superadmin privileges in the admin panel (see `lib/superadmin.ts`)
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` — used only by `npm run seed:admin`, not at runtime
- `RAG_API` — base URL of the external RAG service backing the chatbot (`{RAG_API}/chat/stream`)

## Architecture

**Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix-nova style), Upstash Redis

**Routing:**
- `/app/tools/*` — Individual academic tools (CGPA calculator, attendance, exam routine, etc.)
- `/app/admin/*` — Authenticated admin panel (dashboard, exam upload, team, users, API keys, chat history/settings)
- `/app/api/*` — Serverless API routes for CP leaderboard, exam data, GitHub stars, mobile, chatbot, and admin operations
- `/app/(root pages)` — Landing, about, bus, course catalog, curriculum, privacy, terms

**Data flow:** Most tools are client-side only with local state. Persistent and external data is fetched via:
- Neon PostgreSQL via Drizzle ORM (admin data, exam schedules, chat history, team) — see Database below
- CSV parsing (`csv-parse`) from Google Sheets URLs for exam/course data
- Axios for Codeforces and blood donor APIs
- Upstash Redis for caching API responses in serverless functions

**Database (Drizzle + Neon):** Schema is defined entirely in `lib/db/schema.ts` (tables: `admin_users`, `exam_schedules`, `upload_history`, `api_keys`, `chat_history`, `team_members`). The connection (`lib/db/index.ts`) uses `@neondatabase/serverless` over WebSockets. There are **no migration files** — schema changes are applied with `npm run db:push`. After editing the schema, run `db:push` and update the exported inferred types in the same file.

**Auth (NextAuth v5):** Admin-only, Credentials provider with bcrypt password hashes against the `admin_users` table. `auth.config.ts` holds the edge-safe config (JWT session, `/admin/login` sign-in page, and the `authorized` callback that gates all `/admin/*` and `/api/admin/*` routes except `/admin/setup`). `auth.ts` adds the DB-backed `authorize` and injects an `isSuperAdmin` flag (from `SUPERADMIN_EMAIL`) into the token/session. Use `auth()` server-side; superadmin checks go through `lib/superadmin.ts`.

**Chatbot (RAG):** `app/api/chatbot/chat/route.ts` proxies to an external RAG service at `{RAG_API}/chat/stream` (SSE) and re-streams tokens to the client through the Vercel AI SDK's `createUIMessageStream`. Requests are IP-rate-limited (`lib/chatbot-rate-limit.ts`, configurable from the admin panel) and every user/assistant turn is persisted to `chat_history` (`lib/db/chat-history.ts`) keyed by a `chat_session_id` cookie.

**State management:** No global state library. Uses React local state + Context API (ThemeProvider via `next-themes`, TooltipProvider). Custom hooks live in `/hooks/`.

**Key lib utilities:**
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `lib/seo/` / `lib/metadata.ts` / `lib/structured-data.ts` — SEO helpers
- `lib/cp/` — Codeforces leaderboard logic
- `lib/data/` — Data fetching utilities
- `site.config.ts` — Site name, nav links, social links, OG defaults

**UI components:**
- `components/ui/` — shadcn/ui components (do not edit directly; regenerate via `npx shadcn@latest add <component>`)
- `components/kibo-ui/` — Additional component registry components
- Lucide React for icons

**PDF/Export:** `html2canvas-pro` + `jspdf` + `pdf-lib` used in cover page generator and resume builder tools.

**Maps:** MapLibre GL used in the bus routes tool with configurable light/dark tile styles.

## Deployment

Built as `output: "standalone"` for Docker. A `Dockerfile` is included. Remote images are allowed from `userpic.codeforces.org`, `play-lh.googleusercontent.com`, `avatars.githubusercontent.com`, and `res.cloudinary.com`.

## Adding a New Tool

1. Create `app/tools/<tool-name>/page.tsx`
2. Add feature components under `components/<tool-name>/`
3. Add any data utilities under `lib/`
4. Register the route in `site.config.ts` nav/quick links if it needs to appear in navigation
5. Add SEO metadata using the helpers in `lib/seo/`
