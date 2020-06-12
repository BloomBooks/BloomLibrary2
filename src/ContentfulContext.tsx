import React from "react";
import {
    ContentfulClient,
    ContentfulProvider,
    ContentfulClientInterface,
} from "react-contentful";

const kContentfulSpace = "72i7e2mqidxz";

// there's a problem with the TS types in the Contentful library, hence this "any"
const contentfulClientPublished = new (ContentfulClient as any)({
    accessToken: "XPudkny5JX74w0dxrwqS_WY3GUBA5xO_AzFR7fwO2aE",
    space: kContentfulSpace,
}) as ContentfulClientInterface;

// using the preview key, we can access draft materials for easy previewing while working on content
const contentfulClientPreview = new (ContentfulClient as any)({
    accessToken: "2WiMEBo1hKnLwRjXTzGSX5Zid-UfUcIfJd_JaR43Irs",
    space: kContentfulSpace,
    host: "preview.contentful.com",
}) as ContentfulClientInterface;

export const ContentfulContext: React.FunctionComponent<{}> = (props) => {
    return (
        <ContentfulProvider client={getContentfulClient()}>
            {props.children}
        </ContentfulProvider>
    );
};

export function getContentfulClient() {
    return window.location.pathname.indexOf("_preview") > -1
        ? contentfulClientPreview
        : contentfulClientPublished;
}
