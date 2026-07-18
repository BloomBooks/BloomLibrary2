# Supabase test fixture

`supabase-fixture.sql` is a plain-SQL `pg_dump` of the **public** schema of the
`bloom-core-supabase` local dev database (schema + data): the `books`,
`languages`, `tags`, `users`, `book_languages`, and `related_books` tables, the
`match_topic_tags` / `generate_legacy_style_id` functions, all RLS policies,
grants, and indexes. It carries the ~699-book sample dataset the read-path
integration tests assert against.

It is loaded into a throwaway local Supabase stack in CI (see
`.github/workflows/supabase-integration.yml` + `supabase/config.toml`) so the
gated `RUN_SUPABASE_TESTS` suites — `SupabaseRead.integration.test.ts` and
`SupabaseRead.more.integration.test.ts` — can run against a real
Postgres + PostgREST. It is not used for local development or any deployed
environment.

## It is PII-scrubbed

Every real email address has been replaced with a synthetic `@example.test`
value **before** dumping, so no personal data is checked in:

- `users.email` → `user_<id>@example.test` (deterministic, still unique).
- Emails embedded in the S3 path of `books.base_url` / `books.book_order`
  (URL-encoded as `%40`) and in `books.download_source` →
  `user_<uploader_id>%40example.test` / `...@example.test`.
- Emails embedded in free-text metadata (`books.copyright`, `books.credits`,
  `books.license_notes`, `books.branding_project_name`) →
  `scrubbed@example.test`, leaving the surrounding public text (author /
  publisher names, copyright years, licence wording) intact.

Public published metadata (copyright lines, publisher names, titles) is left as
is. `auth.users` is not included at all — the dump is public-schema only.

## Refreshing the fixture

Run against the **local** `bloom-core-supabase` stack only (never a real
backend). On this machine the db runs under Podman; adjust the `podman exec`
prefix if you talk to Postgres another way (e.g. `psql -h 127.0.0.1 -p 44322`).

```bash
DB=supabase_db_bloom-supabase-bloom-core   # local podman container name

# 1. Scrub every real email in place (idempotent; localhost sample data only).
podman exec -i "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
UPDATE public.users
   SET email = 'user_' || id || '@example.test'
 WHERE email IS NOT NULL AND email NOT LIKE '%@example.test';

-- Emails embedded in free-text published metadata: replace only the token.
UPDATE public.books SET copyright             = regexp_replace(copyright,             '[[:alnum:]._%+-]+@[[:alnum:].-]+', 'scrubbed@example.test', 'g') WHERE copyright             ~ '[[:alnum:]._+-]+@[[:alnum:].-]+' AND copyright             NOT LIKE '%scrubbed@example.test%';
UPDATE public.books SET credits               = regexp_replace(credits,               '[[:alnum:]._%+-]+@[[:alnum:].-]+', 'scrubbed@example.test', 'g') WHERE credits               ~ '[[:alnum:]._+-]+@[[:alnum:].-]+' AND credits               NOT LIKE '%scrubbed@example.test%';
UPDATE public.books SET license_notes         = regexp_replace(license_notes,         '[[:alnum:]._%+-]+@[[:alnum:].-]+', 'scrubbed@example.test', 'g') WHERE license_notes         ~ '[[:alnum:]._+-]+@[[:alnum:].-]+' AND license_notes         NOT LIKE '%scrubbed@example.test%';
UPDATE public.books SET branding_project_name = regexp_replace(branding_project_name, '[[:alnum:]._%+-]+@[[:alnum:].-]+', 'scrubbed@example.test', 'g') WHERE branding_project_name ~ '[[:alnum:]._+-]+@[[:alnum:].-]+' AND branding_project_name NOT LIKE '%scrubbed@example.test%';

-- Uploader email URL-encoded (%40) in the S3 path; keep it tied to uploader_id.
UPDATE public.books
   SET base_url = regexp_replace(base_url,
        '(BloomLibraryBooks/)[[:alnum:]._+-]+%40[[:alnum:].-]+(%2[fF])',
        '\1user_' || coalesce(uploader_id, 'unknown') || '%40example.test\2')
 WHERE base_url ~ '(BloomLibraryBooks/)[[:alnum:]._+-]+%40[[:alnum:].-]+%2[fF]';
UPDATE public.books
   SET book_order = regexp_replace(book_order,
        '(BloomLibraryBooks/)[[:alnum:]._+-]+%40[[:alnum:].-]+(%2[fF])',
        '\1user_' || coalesce(uploader_id, 'unknown') || '%40example.test\2')
 WHERE book_order ~ '(BloomLibraryBooks/)[[:alnum:]._+-]+%40[[:alnum:].-]+%2[fF]';
UPDATE public.books
   SET download_source = regexp_replace(download_source,
        '^[[:alnum:]._+-]+@[[:alnum:].-]+',
        'user_' || coalesce(uploader_id, 'unknown') || '@example.test')
 WHERE download_source ~ '^[[:alnum:]._+-]+@[[:alnum:].-]+';
COMMIT;
SQL

# 2. Dump the public schema (schema + data). Strip three classes of lines that
#    would break a plain `psql` load into a fresh `supabase start` stack:
#      - CREATE SCHEMA public;                     (public already exists)
#      - ALTER DEFAULT PRIVILEGES ...              (not permitted as the
#                                                   non-superuser `postgres` role)
#      - \restrict / \unrestrict                   (pg_dump 17.6 psql meta-command
#                                                   that older CI psql clients reject)
podman exec "$DB" pg_dump -U postgres -d postgres --schema=public --no-owner \
  | grep -vE '^(CREATE SCHEMA public;|ALTER DEFAULT PRIVILEGES |[\](un)?restrict)' \
  > src/data-layer/test/fixtures/supabase-fixture.sql

# 3. Verify NO real emails remain (both literal @ and URL-encoded %40).
#    Both counts must be 0.
grep -oE  '[[:alnum:]._%+-]+@[[:alnum:].-]+' src/data-layer/test/fixtures/supabase-fixture.sql | grep -v  '@example\.test'  | sort -u
grep -oiE '[[:alnum:]._+-]+%40[[:alnum:].-]+' src/data-layer/test/fixtures/supabase-fixture.sql | grep -vi '%40example\.test' | sort -u
```

After refreshing, re-run the suites locally to confirm they stay green:

```bash
RUN_SUPABASE_TESTS=true npx vitest run \
  src/data-layer/test/SupabaseRead.integration.test.ts \
  src/data-layer/test/SupabaseRead.more.integration.test.ts
```
