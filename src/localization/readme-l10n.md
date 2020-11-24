# About Crowdin

We use https://crowdin.com/project/sil-bloom/ for crowd-sourced translation. There are two sources of strings: code and Contentful.com entries. We have a [function on Azure](https://github.com/BloomBooks/bloom-azure-functions/tree/master/contentfulToCrowdin) that runs once a day. It reads strings from Contentful.com, creates various "Chrome format" json files, and pushes them to Crowdin.

# About `crowdin-sync.ts`

Our CI server calls this script whenever the "alpha" version of Bloom Library is built.

--- IMPORTANT ---

This means it is the code on `master` that controls what strings are available. If a string is _removed_ from master, it will be removed from Crowdin and un-localized on other versions of bloomlibrary.org.

We can probably overcome this by using [Crowdin branches](https://support.crowdin.com/versions-management/) (not from git, just the API).

If you want to run `yarn crowdin-sync` locally, you'll need to enter your API token in the environment variable (see the source).

# About `Code Strings.json`.

Strings that are hard-coded into this source have to be entered into this file. When the `crowdin-sync` script runs, it uploads this to crowdin, replacing whatever was there. Later in the script, it downloads all the latest translations of the file.

# Testing languages

If you add `?uilang=<code>` to the url, BloomLibrary should attempt to show the UI in that language. E.g., `?uilang=es` will show Spanish.
