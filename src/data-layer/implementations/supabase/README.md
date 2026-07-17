# Supabase data-layer implementation (read path)

Implements the anonymous browsing path (book grids, search, book detail,
language/topic menus) against a Supabase Postgres database, behind the same
`src/data-layer` interfaces as the ParseServer implementation. Writes and auth
are stubs for now.

## Running blorg against a local Supabase

1. In `bloom-core-supabase`: start the local stack and import sample data
   (see that repo's README — Podman on Windows, ports 443xx):

   ```
   pnpm exec supabase start -x logflare,vector
   pnpm --filter @bloom/sync-tool import-sample
   ```

2. Here:

   ```
   VITE_DATA_LAYER_IMPL=supabase yarn dev
   ```

   Defaults target `http://127.0.0.1:44321` with the local demo anon key;
   override with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

Collections still come from Contentful, book stats from api.bloomlibrary.org,
and thumbnails/artifacts from production S3 — only the database is local.

## Integration tests

```
RUN_SUPABASE_TESTS=true npx vitest run src/data-layer/test/SupabaseRead.integration.test.ts
```

## Known v0 divergences from the Parse implementation

- Free-text search: AND of `ilike` over the precomputed `search` column; no
  relevance ranking (Mongo `$text`/`$score`). Default-ordered searches fall
  back to newest-first.
- Search facets implemented: `title:`, `uploader:`, `feature:`, `rebrand:`,
  `language:`, `bookInstanceId:`, `level:`. Others (e.g. `copyright:`,
  `publisher:`) are recognized and skipped with a console.warn.
- Bare search words are not matched against the tag vocabulary.
- Wildcard tag patterns (`bookshelf:X*`) are skipped (needs an RPC for
  per-array-element matching).
- `anyOfThese` unions sub-query results client-side.
- `tags` has no `category` in the Supabase schema; `TagModel.category` is
  always undefined.
