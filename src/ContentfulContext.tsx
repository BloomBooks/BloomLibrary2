import * as Contentful from "contentful";
const kContentfulSpace = "72i7e2mqidxz";

// there's a problem with the TS types in the Contentful library, hence this "any"
const contentfulClientPublished = Contentful.createClient({
    accessToken: "XPudkny5JX74w0dxrwqS_WY3GUBA5xO_AzFR7fwO2aE",
    space: kContentfulSpace,
});

// using the preview key, we can access draft materials for easy previewing while working on content
const contentfulClientPreview = Contentful.createClient({
    accessToken: "2WiMEBo1hKnLwRjXTzGSX5Zid-UfUcIfJd_JaR43Irs",
    space: kContentfulSpace,
    host: "preview.contentful.com",
});

export function getContentfulClient(): Contentful.ContentfulClientApi {
    // On alpha an localhost, we want to see things that are not in the "Published"
    // state on Contentful
    return window.location.hostname.indexOf("alpha.bloomlibrary.org") > -1 ||
        // Note: if you want to test locally without preview mode,
        // use http://127.0.0.1:3000 instead of http://localhost:3000
        window.location.hostname.indexOf("localhost") > -1
        ? contentfulClientPreview
        : contentfulClientPublished;
}
