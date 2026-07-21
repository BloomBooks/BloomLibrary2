A crowd-sourced web site ([bloomlibrary.org](https://bloomlibrary.org)) for sharing literacy materials, especially templates for translation into minority languages.

Language speakers find books in their own language, and book creators find shellbooks to translate. They upload these to share them with the world.

---

# Development


## Get dependencies
This project uses [Vite+](https://viteplus.dev) (the `vp` CLI) to manage the Node.js runtime and the pnpm package manager, so you don't need to install those separately. Install `vp` (see the [Vite+ docs](https://viteplus.dev)), then run `vp install` in a command line (e.g. in VSCode). That selects the correct Node.js version (from `.node-version`) and the pinned pnpm (from `package.json`), and installs the library dependencies.

## Run locally
To run the site locally, do `vp run dev`

## Storybook
To see various components/scenarios, do `vp run storybook`

## Unit Tests
To run the unit tests, do `vp run test`


### Pointing to Prod, Dev, or Local
BloomLibrary talks to a [Parse](https://parseplatform.org/) server to get the list of books. This can be the Production Parse server, or the Development Parse server, or a locally hosted Parse server. You can manually change which server it talks to if needed. See `ParseServerConnection.ts`.

## Supabase (local database)

We are migrating the database from Parse Server to Supabase (Postgres). On the
`SupabaseMigration` branch, the anonymous read path (grids, search, book detail,
language/topic menus) can run against a **local** Supabase filled with a sample
of real production books. Auth/writes still require Parse.

### One-time setup (Windows)

1. Install [Podman](https://podman.io/) and create its VM
   (Docker Desktop also works, but Podman is our documented path):

   ```powershell
   winget install RedHat.Podman
   podman machine init
   podman machine set --rootful   # rootless port forwarding doesn't reach the Windows host
   podman machine start
   ```

2. Clone [bloom-core-supabase](https://github.com/BloomBooks/bloom-core-supabase)
   (e.g. to `D:\bloom-core-supabase`) and in it run `pnpm install`.

3. Start the local Supabase stack and create the schema. If Docker Desktop is
   also installed, point the CLI at Podman's pipe first:

   ```powershell
   $env:DOCKER_HOST = "npipe:////./pipe/podman-machine-default"
   pnpm exec supabase start -x logflare,vector
   pnpm exec supabase db reset      # applies migrations + seed
   ```

   Note: the local ports are 44321 (API), 44322 (DB), 44323 (Studio) — not the
   Supabase defaults; see that repo's README for why (Windows excluded port
   ranges) and for other gotchas.

4. Import ~100 real books from production Parse (idempotent; re-run to refresh):

   ```powershell
   pnpm --filter @bloom/sync-tool import-sample
   ```

### Running blorg against it (each session)

```powershell
podman machine start                             # after a reboot
cd D:\bloom-core-supabase
$env:DOCKER_HOST = "npipe:////./pipe/podman-machine-default"
pnpm exec supabase start -x logflare,vector
```

then here:

```
VITE_DATA_LAYER_IMPL=supabase yarn dev
```

Parse remains the default when the env var is unset. Collections still come
from Contentful, stats from api.bloomlibrary.org, thumbnails/artifacts from
production S3 — only the book database is local.

### Supabase integration tests

With the local stack running and sample data imported:

```
RUN_SUPABASE_TESTS=true yarn vitest run src/data-layer/test/SupabaseRead.integration.test.ts
```

These assert against live query behavior (including that filters actually
constrain results — pure unit tests with a mocked client can't catch
PostgREST serialization or dropped-filter bugs). Implementation notes and
known v0 divergences: `src/data-layer/implementations/supabase/README.md`.

## Localization

See details in `src/translations/README.md`.

## bloom-player
BloomLibrary depends upon on the [bloom-player](https://github.com/BloomBooks/bloom-player) library to provide the book reading experience.
This is installed as a normal dependency. However, sometimes during the development process you may wish to run your own local build of bloom-player.

If you need to do that, there are a couple options:
### A) pnpm link
One option is to ```pnpm link``` ([docs](https://pnpm.io/cli/link)) to the local bloom-player source code on the same computer.

### B) manual copy
Another option is to manually copy the bloom-player's `/dist` folder build to BloomLibrary's `node_modules/bloom-player/dist`.

---

## Kanban / Bug Reports

We use [YouTrack](https://silbloom.myjetbrains.com) Kanban boards.

## Continuous Build

Each time code is checked in, an automatic build begins in Github Actions, running all the unit tests.

# License

Bloom is open source, using the [MIT License](http://sil.mit-license.org). It is Copyright SIL Global.
"Bloom" is a registered trademark of SIL Global.
