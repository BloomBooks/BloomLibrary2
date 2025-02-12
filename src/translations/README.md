# About Crowdin

We use https://crowdin.com/project/sil-bloom/ for crowd-sourced translation. There are two sources of strings: code and Contentful.com entries.

For code, we have files that live in `src/translations/BloomLibrary.org`.

For Contentful, we have a [function on Azure](https://github.com/BloomBooks/bloom-azure-functions/tree/master/contentfulToCrowdin) that runs once a day. It reads strings from Contentful.com, creates various "Chrome format" json files, and pushes them to Crowdin.

# About `crowdin.yml`

`crowdin.yml` is the configuration file used by the Crowdin CLI which is, int turn, used by our `crowdin-` scripts (see below).

# About `crowdin-download`

Our CI server calls this script whenever the `release` branch of Bloom Library is built/deployed.
We then push those localized files to the S3 bucket for the branch.

We determined that we needed to have all the source files present in order to get all the translation files during the download. So we first download the sources. We have to do this because the Contentful strings files are not part of this repository (see above).
Be careful; apparently, when we download these files, we get many instances of "\\\\]" whereas the strings in Crowdin have "\\]". If you reupload any of them, it will change all those strings. Thankfully, the chron job will change them back; but I think some translations may be lost in process.

Note: doing a "build" on Crowdin takes time, and this command will print the progress. If you see no progress messages, that means that Crowdin is giving you a cached version. Take that into consideration if you don't seem to be getting what you expect to get. In the web UI, on the "Activity" tab, you can see the last time the project was built and if there was any activity since then. You can force a new build on the "Translations" tab.

# About `crowdin-dangerous-upload`

In the release build, we also call `crowdin-dangerously-upload`, which makes the `release` branch be solely responsible for the contents of Crowdin source files.

IMPORTANT:

Be careful. This can remove translations if your source files are not the very latest.

# About code string files

Strings that are hard-coded into this source have to be entered into one of the code string files found in `src/translations/BloomLibrary.org`. These must each be listed in `src/localization/crowdin-file-names.json`. When the `crowdin-dangerous-upload` script runs, it uploads these files to Crowdin, replacing whatever was there. When `crowdin-download` runs, it downloads all the latest translations of the files.

To add a new file:

1. Create the English version (the source) of file in `src/translations/BloomLibrary.org`.
2. Manually drag it into the `BloomLibrary.org` folder on Crowdin.
3. Use the 'Pretranslate" command in the Crowdin UI if the file has strings that have been previously translated.

# Testing localization

To set your browser language, you can

-   change your browser settings
-   add `?uilang=<code>` to the url (but this gets lost)
-   enter `uilang=<code>` in the search box

You will need to get local language files with `yarn crowdin-download` to test locally. This requires setting a `BLOOM_CROWDIN_TOKEN` environment variable. This token isn't visible on the Crowdin site; it only shows it once. So you have to get it from another Bloom developer or from the Azure configuration.