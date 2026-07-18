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
| A1 | Search relevance ranking (Parse $text/$score vs ilike-AND + newest-first) | ⚠ deferred by decision 2026-07-18 — accepted degraded for switchover test period; revisit after data-migration milestone | both repos |
| A2 | Non-canonical `topic:` filters silently return nothing (Parse regex-ORs) | ❌ open — TODO'd for an RPC | both repos |
| A3 | `tags.category` column missing → `TagModel.category` always undefined | ✅ accepted — verified zero UI consumers of TagModel.category in anon scope (only Contentful page fields use `.category`) | — |
| A4 | `sendConcernEmail` throws under Supabase ("Report this book" is anon-reachable) | ✅ send-concern-email edge function built (bloom-core-supabase branch `send-concern-email`, unmerged); Supabase client impl wired to it; mixed mode (D1) meanwhile routes the live path via Parse | both repos |
| A5 | `anyOfThese`/`derivedFrom` union IDs client-side then `.in("id",…)` — scale risk | ✅ verified at 699 local books: broad search ~150ms, anyOfThese ~120ms (75f566b); re-check after full data sync | blorg |
| A6 | Wildcard tag inside any-of list fails closed | ⚠ accepted (no known caller); covered by unit tests where reachable | blorg |

## B. Test safety net

| # | Item | Status |
|---|------|--------|
| B1 | Unit tests for `SupabaseBookQueryBuilder` (~646 lines, riskiest layer) | ✅ 60 tests, CI-safe (30a03fa) |
| B2 | Unit tests for `SupabaseBookMapper` | ✅ 9 tests (30a03fa) |
| B3 | Integration suite breadth (real collection filter shapes, guards for A6) | ✅ 21 gated tests across 2 files (75f566b); known gap: derivedFrom publisher-negation branch lacks real-data coverage in the sample |
| B4 | Contract tests runnable in CI (local stack in GH Actions; db repo CI already resets a stack) | ❌ open |
| B5 | Runtime smoke test: browse the app with `VITE_DATA_LAYER_IMPL=supabase` against local stack | ✅ passed 2026-07-18 (home/search/detail/language/topic; zero data-layer failures) |

## C. Parse usage outside the data layer (switchover blockers)

| # | Item | Status |
|---|------|--------|
| C1 | `export/freeLearningIO.ts` raw Parse REST call w/ hardcoded prod app id | ✅ routed through book repository (81e88ff); accepted narrowing: inCirculation strictly-true vs legacy true-or-unset |
| C2 | Bloom API auth bridge (`connection/ApiConnection.ts`) reads session token from a singleton login no longer populates — confirmed live bug | ✅ fixed (8f2265c); follow-up: same dead-singleton reads remain in LibraryQueries/LibraryQueryHooks/LibraryUpdates (see C4) |
| C3 | Stats path posts Parse query DSL (`$regex`, `$score`) to api.bloomlibrary.org | ❌ open — needs server-side plan; document as external dependency |
| C4 | Dead/duplicate Parse plumbing (`connection/ParseServerConnection.ts` dead fns, `LibraryUpdates.updateBook`, duplicated connection config) | ✅ both files deleted; live calls rewired to data-layer ParseConnection (01b37a1) |

## D. Guardrails for out-of-scope paths

| # | Item | Status |
|---|------|--------|
| D1 | Under supabase impl: login/write UI must not route into throwing stubs (decide: hide, disable, or keep Parse-backed) | ✅ decided 2026-07-18 — mixed mode: keep auth/user Parse-backed. Supabase registration binds ParseAuthenticationService/ParseUserRepository under the Supabase impl keys (`implementations/supabase/index.ts`); getBloomApiHeaders() therefore carries the real Parse session token. Covered by DataLayer.test.ts |
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
