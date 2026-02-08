# Contributing Guidelines

Thanks for wanting to contribute to **SEU CampusMate**—the web companion for Southeast University students. Follow these guidelines to keep the project consistent and easy to maintain.

---

## Who Can Contribute

- Southeast University students and alumni
- Anyone contributing to the SEU student community

---

## How to Contribute

1. **Fork** the repository (if you're not a core maintainer)
2. **Create a branch**:
   - `feature/tool-name` — new tools (e.g. `feature/grade-converter`)
   - `fix/issue-description` — bug fixes (e.g. `fix/cgpa-decimal-rounding`)
   - `docs/readme-update` — documentation only
3. **Make your changes** and test locally
4. **Commit** with a clear message (see format below)
5. **Push** your branch
6. **Open a Pull Request** and describe what you changed

---

## Branch Rules

- Do **not** push directly to `main`
- All changes go through Pull Requests
- One feature or fix per branch
- Branch from the latest `main`

---

## Code Rules

### Project Structure

- **`app/`** — Pages and routes (Next.js App Router). Add tools under `app/tools/`.
- **`components/`** — Reusable UI. Shared components go in `components/ui/` (shadcn) or domain-specific folders.
- **`lib/`** — Utilities, metadata, data fetching. Use `lib/metadata.ts` for SEO and page configs.

### Tech Conventions

- **TypeScript** — Use proper types; avoid `any`
- **Tailwind** — Prefer Tailwind classes over custom CSS
- **shadcn/ui** — Add components via `npx shadcn@latest add [component]` when needed
- **Next.js** — Use App Router; server components by default, `'use client'` only when needed
- **Metadata** — Add new pages to `lib/metadata.ts` with title, description, and path

### Before Submitting

- Run `npm run lint` — no ESLint errors
- Run `npm run build` — build succeeds
- Remove unused imports and files
- Format code (Prettier if configured)
- Comment non-obvious logic

---

## Commit Message Format

Use clear, present-tense messages:

**Good:**

- Add CGPA calculator validation for decimal grades
- Fix exam routine search on mobile
- Update metadata for tuition calculator page

**Bad:**

- update
- fix stuff
- WIP

---

## Reporting Bugs

When opening an issue, include:

- What you expected vs. what happened
- Steps to reproduce
- Screenshot or screen recording (for UI bugs)
- Device, OS, and browser (if relevant)

---

## Adding New Tools

When adding a new academic tool:

1. Create `app/tools/your-tool/page.tsx`
2. Add metadata in `lib/metadata.ts` (pageMetadata + path)
3. Register the tool in `components/feature/feature-data.tsx`
4. Add a link in the footer if it’s a main tool

---

## Review Process

- At least one team member reviews before merge
- CI checks (lint, build) must pass
- A maintainer approves the final merge

---

## What Not to Do

- No plagiarism or copy-paste from AI without understanding the code
- No API keys, tokens, or secrets in code — use `.env.local`
- No large commits that mix multiple unrelated changes
- No direct changes to `main`

---

## Thanks

Every contribution helps SEU students. Thanks for your time and effort.
