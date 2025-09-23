# Supabase Migration Plan: Estimated Scope of Work

This is a snapshot of ongoing conversation with LLMs with access to this codebase. The purpose is to help us think about the task, it's not anything near to an actual plan.

## Things we do know

* We will be migrating this client code from Parse Server to a SQL database on Supabase.
* We cannot yet use Supabase native auth. We will need to continue to use Firebase.
* How the cloud functions and DB itself are migrated is not in scope here, that's handled elsewhere.
* We do not need to have these two system running simultaneously in production.
* We do not need to gradually migrate. The legacy code is not under active development.
* We will standardize on the official Supabase JS SDK (`@supabase/supabase-js`) for all database access and authentication.

## Known unknowns

It is not clear yet how much effort should go into code base preparation, including:
* isolating all existing ParseServer-specific code,
* creating an anti-corruption layer with (intially) a ParseServer impelementation, against which unit tests can run
* adding new tests to lock down current behavior

---

### BLORG Frontend Application Refactoring

1.  **Connection and Authentication (SDK):**
    -   Create `src/data/supabaseClient.ts` to initialize and export a configured Supabase client.
    -   Replace `connectParseServer()` with Supabase auth flows (signInWithIdToken or signInWithOAuth as appropriate) and session handling via the SDK.
    -   Files to change:
        -   `src/connection/ParseServerConnection.ts` — removed/replaced.
        -   `src/authentication/firebase/firebase.ts` — replace `connectParseServer` usage with Supabase auth calls.
        -   `src/authentication/authentication.ts` — replace logout with `supabase.auth.signOut()`.

2.  **Queries and Mutations (SDK):**
    -   Replace all REST calls and `ParseServerConnection` imports with repository functions that use the SDK: `supabase.from('table').select(...)`, `.insert(...)`, `.update(...)`, and RPC calls with `supabase.rpc('fn', params)`.
    -   Files to change:
        -   `src/connection/LibraryQueries.ts`
        -   `src/connection/LibraryQueryHooks.ts`
        -   `src/connection/LibraryUpdates.ts`
        -   `src/connection/ApiConnection.ts`
        -   `src/components/BulkEdit/BulkChangeFunctions.ts`
        -   `src/components/BookDetail/ReportDialog.tsx`

3.  **Data Model Mapping:**
    -   Update functions that map DB responses to frontend models to reflect SQL row shapes.
    -   Files to change:
        -   `src/model/Book.ts` — replace `createBookFromParseServerData` and `finishCreationFromParseServerData` with equivalents for Supabase rows.
        -   `src/model/ArtifactVisibilitySettings.ts` — replace `createFromParseServerData` usages.
        -   `src/export/freeLearningIO.ts` — update to call the new `createBookFromSupabaseRow`.

4.  **Repository Isolation (SDK under the hood):**
    -   Create small data-access modules to keep SDK usage localized:
        -   `src/data/booksRepo.ts` — `getBook`, `searchBooks`, `updateBook`, `updateArtifactVisibility`, etc.
        -   `src/data/usersRepo.ts` — auth helpers/user profile.
        -   `src/data/adminRepo.ts` — staff/bulk edit mutations.
    -   Refactor callers listed above to use these repos instead of direct SDK calls.

---


### Test Coverage and Pre‑Migration Hardening

Goal: lock in current behavior so the migration can be validated quickly and safely on the branch.

What exists now (indicative sample):
- `src/connection/LibraryQueryHooksFast.test.ts` — unit tests for building Parse query objects (offline, no network).
- `src/connection/LibraryQueryHooks.test.ts` — networked tests against a Parse unit-test server using axios to verify end‑to‑end search semantics (quoted terms, tag facets, uploader/copyright).
- `src/connection/sorting.test.ts` — sorting behavior of titles and locale nuances.
- `src/connection/SplitString.test.ts` — parsing query strings into parts.
- `src/components/ArtifactHelper.test.ts` — URL parsing for artifact names.
- `src/model/Book.test.ts` — feature normalization (e.g., quiz implies activity).
- `src/model/SpecialSearch.test.ts` — special search parsing.

Gaps and risks relative to Supabase:
- Query-builder semantics will change: `constructParseBookQuery` tests lock in Parse JSON, not desired SQL filters or repo inputs/outputs.
- Networked Parse unit tests will be invalid after migration; we need equivalents that assert outputs (datasets returned), not Parse-specific endpoints.
- Data mapping: no tests currently assert that `createBookFromParseServerData` produces stable `Book` objects from backend rows.
- Auth/session flows have no explicit tests.

Recommended pre‑migration work (on the branch before large refactors):
1) Introduce repository‑level contract tests (backend‑agnostic)
- Create tests that call repo functions and assert returned arrays/objects, not transport format.
- New tests (suggested files):
  - `src/data/__tests__/booksRepo.contract.test.ts`
    - getBook(id) returns minimal shape { id, title, tags, updatedAt }
    - searchBooks(q) respects quoted terms, tag facets, uploader, publisher filters
    - updateBook(id, patch) persists and is observable on a subsequent read
  - `src/data/__tests__/adminRepo.contract.test.ts` (only for admin flows used by BulkEdit)
- Temporarily wire these tests to current Parse implementation through a thin adapter so they pass now; then swap the adapter to Supabase during migration.

2) Freeze critical behaviors with pure unit tests
- Replace Parse‑specific query JSON assertions with input/output tests around new helpers:
  - Add `src/data/query/filters.test.ts` covering:
    - parsing search string to structured filter (quoted phrases, facets like `topic:`, `region:`, `bookshelf:`)
    - level filters (`level:1`, `level:empty`) logic
- Add mappers tests:
  - `src/model/Book.mapper.test.ts` for `createBookFromSupabaseRow` (to be introduced) ensuring stable `Book` object creation and date parsing.

3) Guard UI‑visible behavior
- Keep existing tests that validate sorting and artifact URL behavior (already backend‑agnostic).
- Add a minimal test for `getBestBookTitle`/`parseAllTitles` behavior using JSON from `allTitles` to ensure unchanged results.

4) Test utilities and setup
- Add a tiny test data factory for books to reduce duplication in repo tests.
- Ensure Vitest config supports node + jsdom where needed (already `environment: "jsdom"`; repo tests can run under node if desired via per‑file override).

Removal/transition plan for Parse‑specific tests
- Mark `src/connection/LibraryQueryHooks.test.ts` as legacy and keep until Supabase repos pass the contract tests.
- Replace `constructParseBookQuery` unit tests with `filters.test.ts` that assert our own filter struct rather than Parse JSON.

Minimal acceptance to proceed with migration work
- Contract tests for `booksRepo` pass against current backend adapter.
- Mapper tests for `Book` pass using sample rows.
- Sorting/URL/helper tests continue to pass unchanged.

---

### Summary of Effort

The migration work remains concentrated in `src/connection`, `src/model`, and `src/authentication`, with new `src/data/*` modules to isolate SDK usage. The largest tasks are translating queries/mutations to SDK calls and remapping data models to the SQL schema.
