# Pathfinder — College Discovery Platform

A full-stack MVP for the AI Software Engineer Internship demo task.
**Role:** Full Stack Engineer · **Track:** A — College Discovery Platform

## Features implemented (4, done well, instead of 6 done shallowly)

1. **College listing + search** — text search across name/city/state, filters
   (state, type, max fees, min rating), server-side sort, and "load more"
   pagination. All filtering/sorting/pagination happens in Postgres via
   Prisma, not in the frontend.
2. **College detail page** — overview, courses, 3-year placement history,
   and reviews, all relational data pulled with one Prisma `include` query.
3. **Compare colleges** — pick up to 3 colleges from any page, see them
   side by side (location, type, rating, fees, latest avg package,
   placement rate).
4. **Rank predictor** — enter exam + rank + category (+ optional branch),
   get colleges where your rank clears the branch cutoff, ranked by
   closeness of fit.

Not built: authentication/saved items and the Q&A/discussion feature —
cut deliberately to keep the four shipped features solid rather than
spreading effort across six shallow ones (explicitly allowed by the brief).

## Architecture decisions

- **Data model**: `College` has four related tables — `Course`,
  `Placement`, `Review`, `Cutoff` — instead of one wide flat table. This
  keeps each concern independently queryable and matches how the real
  reference sites (Careers360, Collegedunia) structure this data.
- **Predictor logic**: not a fake "AI" black box. It's a direct query —
  find `Cutoff` rows where `closingRank >= user's rank`, for the chosen
  exam/category/branch, sorted by `closingRank ascending`. That ordering
  surfaces the *tightest realistic matches* first (colleges closest to
  the user's actual rank) rather than the easiest matches. This is exactly
  how real rank predictors work and is honest about being rule-based.
- **Compare basket**: kept in `localStorage` via `lib/compareStore.ts`
  rather than a backend table, because it's ephemeral, per-browser,
  session-scoped selection state — a database round trip for this would
  add latency for no benefit. If "saved comparisons" (persisted across
  devices) were in scope, that would move server-side behind auth.
- **API design**: three REST routes (`/api/colleges`, `/api/colleges/[id]`,
  `/api/predictor`), all doing filtering/sorting/pagination in the
  database via Prisma `where`/`orderBy`/`skip`/`take` — never fetching
  everything and slicing in JS.
- **No external images**: colleges get a deterministic solid-color
  "logo" initial instead of placeholder photos, so the UI doesn't depend
  on a stock-image pipeline that has nothing to do with the assignment.

## Tradeoffs / what I'd do differently with more time

- Seed data (48 colleges) is synthetically generated with deterministic
  formulas, not real scraped data — fine for demoing search/filter/predictor
  logic, but real cutoff data would need per-year, per-round granularity.
- No caching layer (e.g. Redis) on `/api/colleges` — at this data volume
  Postgres indexes on `city`, `state`, `avgFeesPerYear`, `rating` are
  sufficient; would revisit if the catalog grew to 100k+ rows.
- No optimistic UI on the compare basket — toggling re-reads
  `localStorage` synchronously, which is fine at this scale but would
  need a proper client store (Zustand/Jotai) if compare grew more state.

## Edge cases handled

- Predictor rejects invalid/negative rank and unknown exam values (400,
  not a silent empty result).
- College detail route accepts either the college's `id` or its `slug`.
- Search debounces input (350ms) so every keystroke doesn't hit the API.
- Empty states are explicit: "no colleges match these filters" and
  "nothing to compare yet" rather than a blank screen.
- Compare basket caps at 3 — adding a 4th evicts the oldest.

## Running locally

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL — see below for a free option
npx prisma generate
npx prisma db push          # creates tables from prisma/schema.prisma
npx tsx prisma/seed.ts      # seeds 48 colleges with courses/placements/reviews/cutoffs
npm run dev
```

## Free deployment (no cost)

1. **Database — Neon** (neon.tech): sign up free, create a project, copy
   the pooled connection string into `DATABASE_URL`.
2. **Push schema + seed** against that URL:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
3. **App — Vercel** (vercel.com): import this GitHub repo, add the same
   `DATABASE_URL` as an environment variable in Vercel's project settings,
   deploy. Vercel auto-detects Next.js — no build config needed.
4. Both Neon's and Vercel's free tiers are sufficient for this demo's
   traffic and data volume.

## For the Loom video

Suggested structure (5–10 min):
1. Live demo: search → filter → detail page → add 2 to compare → predictor.
2. Walk through `prisma/schema.prisma` — why four related tables, not one.
3. Walk through `/api/predictor/route.ts` — explain the cutoff-matching
   logic and why results are sorted by margin, not by college name/rating.
4. Mention the two tradeoffs above (localStorage for compare, no caching
   layer yet) and why they're the right call at this scale.
5. What you'd build next if this were a real product (auth + saved
   comparisons, real scraped data, Q&A feature).
