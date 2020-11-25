# About Crowdin

We use https://crowdin.com/project/sil-bloom/ for crowd-sourced translation. There are two sources of strings: code and Contentful.com entries.

For Code, we have files that live in src/location/

For Contentful, we have a [function on Azure](https://github.com/BloomBooks/bloom-azure-functions/tree/master/contentfulToCrowdin) that runs once a day. It reads strings from Contentful.com, creates various "Chrome format" json files, and pushes them to Crowdin.

# About `crowdin-sync.ts`

Our CI server calls this script whenever the "alpha" version of Bloom Library is built. You can invoke the download portion while developing with `yarn crowdin-download`. You'll need to enter your API token in the environment variable "bloomCrowdinApiToken".

IMPORTANT:

1.  Be careful doing the _upload_ companion to this, as this can remove translations if your source files are not the very latest.
2.  Because it is the alpha build that does the upload, it is the code on `master` that controls what strings are available. If a string is _removed_ from master, it will be removed from Crowdin and un-localized on other versions of bloomlibrary.org. We can probably overcome this by using [Crowdin branches](https://support.crowdin.com/versions-management/) (not from git, just the API).

# About code string files.

Strings that are hard-coded into this source have to be entered into one of the code string files found in `src/localization`. These must each be listed in `src/localization/l10nFilesForCodeStrings.ts`. When the `crowdin-dangerous-upload` script runs, it uploads these files to crowdin, replacing whatever was there. When `crowdin-download` runs, it downloads all the latest translations of the files.

To add a new file:

1. Create the English version (the source) of file in `src/localization`
2. Manually drag it into the `Bloom Library.org` folder on Crowdin
3. Use the 'Pretranslate" command in the Crowdin UI if the file has strings that have been previously translated.
4. Do `yarn crowdin-download`. Among other things, this will add the file to `crowdin-file-names.json`.

# Testing languages

If you add `?uilang=<code>` to the url, BloomLibrary should attempt to show the UI in that language. E.g., `?uilang=es` will show Spanish.
