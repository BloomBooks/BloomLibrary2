# Supabase switchover readiness — blorg

Goal: prove blorg is 100% ready to flip `VITE_DATA_LAYER_IMPL=supabase` for the
**anonymous browsing** scope (the declared scope of the current Supabase data
layer — see `src/data-layer/implementations/supabase/README.md`). Auth, writes,
and moderation remain on Parse until the backend's auth milestone.

Derived from a 3-way gap analysis (data-layer parity matrix, whole-repo Parse
sweep, bloom-core-supabase backend inventory) on 2026-07-18.

## A. Read-path parity gaps (blorg + backend)

| # | Item | Status | Where |
|---|------|--------|-------|
| A1 | Search relevance ranking (Parse $text/$score vs ilike-AND + newest-first) | ❌ open — needs Postgres FTS (tsvector + rank) in backend + client ordering | both repos |
| A2 | Non-canonical `topic:` filters silently return nothing (Parse regex-ORs) | ❌ open — TODO'd for an RPC | both repos |
| A3 | `tags.category` column missing → `TagModel.category` always undefined | ❌ open — confirm UI impact, then schema+sync+mapper | both repos |
| A4 | `sendConcernEmail` throws under Supabase ("Report this book" is anon-reachable) | ❌ open — needs edge function or transitional routing to Parse cloud fn | both repos |
| A5 | `anyOfThese`/`derivedFrom` union IDs client-side then `.in("id",…)` — scale risk | ⚠ verify at production scale | blorg |
| A6 | Wildcard tag inside any-of list fails closed | ⚠ accepted (no known caller) — guard test wanted | blorg |

## B. Test safety net

| # | Item | Status |
|---|------|--------|
| B1 | Unit tests for `SupabaseBookQueryBuilder` (~646 lines, riskiest layer, currently 0 unit tests) | ❌ in progress |
| B2 | Unit tests for `SupabaseBookMapper` | ❌ in progress |
| B3 | Integration suite breadth (real collection filter shapes, guards for A6) | ⚠ thin (9 tests) |
| B4 | Contract tests runnable in CI (local stack in GH Actions; db repo CI already resets a stack) | ❌ open |
| B5 | Runtime smoke test: browse the app with `VITE_DATA_LAYER_IMPL=supabase` against local stack | ❌ in progress |

## C. Parse usage outside the data layer (switchover blockers)

| # | Item | Status |
|---|------|--------|
| C1 | `export/freeLearningIO.ts` raw Parse REST call w/ hardcoded prod app id | ❌ open — route through repository or retire |
| C2 | Bloom API auth bridge (`connection/ApiConnection.ts`) reads session token from a singleton login no longer populates — likely live bug today | ❌ in progress — verify + fix |
| C3 | Stats path posts Parse query DSL (`$regex`, `$score`) to api.bloomlibrary.org | ❌ open — needs server-side plan; document as external dependency |
| C4 | Dead/duplicate Parse plumbing (`connection/ParseServerConnection.ts` dead fns, `LibraryUpdates.updateBook`, duplicated connection config) | ❌ open — delete/consolidate |

## D. Guardrails for out-of-scope paths

| # | Item | Status |
|---|------|--------|
| D1 | Under supabase impl: login/write UI must not route into throwing stubs (decide: hide, disable, or keep Parse-backed) | ❌ decision needed |
| D2 | Analytics interface unwired on both sides (Parse side unregistered) — confirm nothing calls `getAnalyticsService()` before wiring | ✅ verified (zero callers) |

## E. Backend dependencies (bloom-core-supabase)

| # | Item | Status |
|---|------|--------|
| E1 | `fs` file/thumbnail serving | ✅ live in production |
| E2 | `social` OpenGraph previews | ⚠ code done; production worker routing pending |
| E3 | Read schema (books/languages/tags/users + RLS anon read) | ✅ local milestone done |
| E4 | Full production data sync (watermark + tombstones) | ❌ future milestone (explicitly after this readiness work) |
| E5 | FTS/search-string derivation triggers | ❌ open (blocked on A1 design) |

"100% ready" = all A/B/C items closed or explicitly accepted, D decided, and the
switchover still gated on E4 (data migration), which is the next milestone after
this one.
