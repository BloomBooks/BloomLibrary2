---
name: contentful-api
description: Read or change bloomlibrary.org content in Contentful (its CMS) from a script — edit a page such as Support or About, upload an image or logo, publish. Use when asked to change text, links or images on a bloomlibrary.org page that is not in the BloomLibrary repo's code.
---

bloomlibrary.org pulls its pages, banners and collections from Contentful at run time, so most
copy on the site is changed in Contentful, not in this repo's code. This skill drives the
Contentful Management API (CMA) through `cma.mjs` in this folder. The commands below name the
scripts by file name; run them from the repo root as `node .claude/skills/contentful-api/<script>`.

- Space `72i7e2mqidxz`, environment `master` (also in `src/ContentfulContext.tsx`).
- Web UI for a human check: `https://app.contentful.com/spaces/72i7e2mqidxz/entries/<entryId>`.

## Token

The write token is the User environment variable `BLOOM_CONTENTFUL_CMA_WRITE_TOKEN`. It may be
missing from the agent's process environment (the shell was started before it was set), so read
it from the registry and run the script in **one** PowerShell call:

```powershell
$env:BLOOM_CONTENTFUL_CMA_WRITE_TOKEN = [Environment]::GetEnvironmentVariable('BLOOM_CONTENTFUL_CMA_WRITE_TOKEN','User')
node .claude/skills/contentful-api/cma.mjs page support
```

Keep the token inside the environment variable: never echo it or put it on a command line. If
the registry has no such variable either, stop and ask the developer to set it.

## How a page is built

A page is an entry of content type `page`, looked up by its `urlKey` field. The site serves it
at `/page/<any breadcrumbs>/<urlKey>`: `https://bloomlibrary.org/page/resources/support` is the
entry with `urlKey` `support`. Fields the site reads (`src/components/pages/ContentfulPage.tsx`):

- `label` — the `<h1>` title, unless `hideTitle` is true.
- `markdownBody` — the body, rendered by `src/components/markdown/BlorgMarkdown.tsx` (markdown-to-jsx). Plain markdown
  and inline HTML both work, plus the custom tags registered there: `<Image id="<assetId>"/>`,
  `<Columns>`/`<Column>`, `<Section>`, `<Button>`, `<Vimeo>`, `<BookCards>`, and others. Read
  `BlorgMarkdown.tsx` for the current list before using one.
- `css` — CSS injected into the page wrapper, scoped by the class `contentful-page <urlKey>`.
  Use it to style a block you added, rather than inline `style` attributes.

`<Image>` renders at `width: 100%`. For a logo, either override that through the page's `css`
field, or use a plain `<img src="https://images.ctfassets.net/...?h=120" height="60">` with the
asset's URL (the `?h=` parameter is Contentful's image API resizing it).

## Changing content

Every change is a **draft** until published, and the live site shows only published content.
Work in this order:

1. `node cma.mjs page <urlKey>` — note the entry id and `status`. If it says
   "changed since last publish", someone has unpublished edits in progress: tell the developer
   before publishing, because publishing ships their edits too.
2. Save the `page` output to a file in the scratchpad as the backup and the base for the edit.
   Text fields are **per locale**: `markdownBody` and `label` carry `en-US`, `es` and `fr`
   versions, and a visitor using Spanish sees only the `es` one. Make the change in every
   locale the field has, translating any new text, and keep the existing content intact around
   your addition.
3. Images: first `node cma.mjs find-assets <text>` to reuse one already in the space. For a
   company's logo, take it from the company's brand page, or from this repo when the site
   already shows it (`src/components/Footer.tsx` has Contentful's; check which background it
   is for). The Donate page (`urlKey` `donate`) already lists sponsor logos; reuse its assets. A logo lifted from a company's site header is often white text for a dark header,
   and invisible on our white pages: check its fills, and look at it in the preview. Then
   `node cma.mjs upload-asset <file-or-url> "<title>" "<alt text>"` creates,
   processes and publishes the asset and prints its id and URL. The description becomes the
   image's alt text through `<Image>`.
4. `node cma.mjs set-field <entryId> markdownBody <file> <locale>` writes the draft, once per
   locale.
5. Look at the draft before publishing: `https://bloomlibrary.org/_preview/page/<urlKey>` serves
   draft content. Load it in the browser and check the result, including at phone width.
6. Publish only when the developer asked for it to go live: `node cma.mjs publish-entry <entryId>`.
   Then report the live URL.

To undo a draft, `node restore-fields.mjs <entryId> <backup.json>` puts the fields back from
the step-2 backup, and `node diff-published.mjs <entryId>` confirms the draft again equals the
published version. The web UI still marks the entry "Changed" after that, though the content
matches.

For anything `cma.mjs` lacks, import `cma()` from it in a script placed in this folder. The CMA
rules that bite: every update and publish needs the entry's current `sys.version` in
`X-Contentful-Version` (a stale one gets 409, so re-GET and retry); fields are keyed by locale
(`defaultLocale()`); assets must be processed before they can be published. API reference:
https://www.contentful.com/developers/docs/references/content-management-api/
