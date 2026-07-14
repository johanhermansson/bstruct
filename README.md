# bStruct

A dashboard of movable widgets — sticky notes, todo lists and **structs**:
groups of recurring reminders that float to the top as they become overdue.

Rewritten from the original PHP/CodeIgniter app as a **Next.js 16** app on
**Vercel**, with **Neon Postgres** (Drizzle ORM) and **Neon Auth**.

## How structs work (the recurrence model)

A struct item isn't scheduled on a calendar — it decays:

```
urgency = seconds since last done / recurrence interval
```

- Items inside a struct sort by urgency, most overdue first.
- Once a full interval has elapsed (urgency ≥ 1) the item is **due** and a
  checkbox appears.
- Checking it off resets the clock and records a row of completion history.
- Intervals: Daily, Weekly, Every two weeks, Monthly, Quarterly, Yearly.

The **What's next** page (`/next`) aggregates every reminder across all your
boards into "Due now" and "Coming up", sorted by the same ratio.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Hosting | Vercel |
| Database | Neon Postgres via `pg` Pool + `drizzle-orm/node-postgres` (+ `attachDatabasePool` for Fluid compute) |
| Auth | `@neondatabase/auth` (Neon Auth, managed Better Auth) with prebuilt UI |
| Styling | Tailwind CSS 4 (CSS-first `@theme` tokens, OKLCH sticky palette, dark mode) |
| Board drag | Custom pointer-events hook (`src/hooks/use-free-drag.ts`); dnd-kit for todo-item sorting |
| Tests | Vitest (domain logic: urgency, fuzzy dates, z-ordering) |

## Local development

1. **Create a Neon project** (or a dev branch of one) and enable **Auth** in
   the Neon console.
2. Copy `.env.example` to `.env.local` (Next.js) and `.env` (drizzle-kit) and
   fill in the four variables.
3. Install and migrate:

   ```bash
   npm install
   npm run db:migrate                                   # applies drizzle/ against DATABASE_URL_UNPOOLED
   psql "$DATABASE_URL_UNPOOLED" -f drizzle/seed.sql    # seeds the six recurrence levels (idempotent)
   ```

4. `npm run dev` and open http://localhost:3000 — you'll be redirected to
   sign-up on first visit.

Optional: apply `drizzle/optional/neon_auth_fks.sql` once Neon Auth has
provisioned its schema, to get cascading cleanup when users are deleted. The
app never relies on it (every query is scoped by `user_id`).

## Deploying to Vercel

1. Import this repository into Vercel (framework preset: Next.js).
2. Add the **Neon integration** to the project — it injects `DATABASE_URL`
   (pooled) and `DATABASE_URL_UNPOOLED` for every environment, and can create
   a database branch per preview deployment.
3. Add `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` (≥ 32 random chars)
   to the project's environment variables.
4. Run migrations against production **manually or from CI** — never during
   `next build` (preview builds would race each other on a shared database):

   ```bash
   DATABASE_URL_UNPOOLED=... npm run db:migrate
   psql "$DATABASE_URL_UNPOOLED" -f drizzle/seed.sql
   ```

## Checks

```bash
npm run lint        # ESLint (flat config)
npm run typecheck   # tsc --noEmit
npm test            # Vitest domain tests
npm run build       # production build (Turbopack)
```

## Project layout

```
src/proxy.ts                      auth guard (Next 16 middleware replacement)
src/app/(app)/boards/[boardId]/   the board page (RSC data fetch)
src/app/(app)/next/               "What's next" urgency overview
src/app/auth/[path]/              Neon Auth prebuilt views
src/lib/db/schema.ts              Drizzle schema (boards, notes, todos, structs)
src/lib/db/queries/               board + what's-next reads (urgency in SQL)
src/lib/actions/                  server actions (all mutations, owner-scoped)
src/lib/domain/                   urgency + fuzzy-date logic (unit-tested)
src/components/board/             free-drag board, store, position buffer
src/components/stack/             mobile stacked view of the same widgets
src/components/widgets/           Note / Todo / Struct cards
drizzle/                          SQL migrations + seed.sql
```

## Migration notes (from the legacy PHP app)

- This is a fresh start: the old MySQL data is not migrated and old
  passwords could not be carried over (users sign up again via Neon Auth).
- ⚠️ The legacy code contained committed secrets (MySQL password, a SendGrid
  API key, an encryption key and password salt). They remain in git history —
  **rotate/revoke all of them** if not already done.
