# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

There is no test suite configured.

## Environment Variables

Copy `.env.example` to `.env.local` and populate:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis caching layer
- `GOOGLE_SHEETS_CSV_URL` / `EXAMS_CSV_URL` — CSV data sources for course/exam data
- `NEXT_PUBLIC_ACADEMIC_CALENDAR_URL` / `NEXT_PUBLIC_BLOOD_DONORS_API_URL` — External APIs
- `NEXT_PUBLIC_MAP_STYLE_DARK` / `NEXT_PUBLIC_MAP_STYLE_LIGHT` — MapLibre GL tile styles
- `CP_USERNAMES_API_URL` / `CODEFORCES_API_BASE` — Codeforces leaderboard integration
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — Cloudinary uploads for `/about` team photos (admin)

## Architecture

**Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix-nova style), Upstash Redis

**Routing:**
- `/app/tools/*` — Individual academic tools (CGPA calculator, attendance, exam routine, etc.)
- `/app/api/*` — Serverless API routes for CP leaderboard, exam data, GitHub stars, mobile
- `/app/(root pages)` — Landing, about, bus, course catalog, curriculum, privacy, terms

**Data flow:** Most tools are client-side only with local state. External data is fetched via:
- CSV parsing (`csv-parse`) from Google Sheets URLs for exam/course data
- Axios for Codeforces and blood donor APIs
- Upstash Redis for caching API responses in serverless functions

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
