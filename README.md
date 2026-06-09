A web site ([bloomlibrary.org](https://bloomlibrary.org)) for sharing literacy materials, especially templates for translation into minority languages.

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
