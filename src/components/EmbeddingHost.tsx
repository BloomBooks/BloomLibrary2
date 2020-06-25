import React, { useEffect } from "react";
import { useContentful } from "../connection/UseContentful";
import { convertContentfulEmbeddingSettingsToIEmbedSettings } from "../model/Contentful";
import { splitPathname, CollectionWrapper } from "./Routes";
import { useLocation } from "react-router-dom";

// Note, there is a Storybook story for testing this in an iframe.
// This relies on a matching Contentful "Embedded Settings".
// At the time of this writing, you can also test this with localhost:3000/embed/embed-test/enabling-writers
export const EmbeddingHost: React.FunctionComponent<{
    settingsUrlKey: string;
    urlSegments: string;
}> = (props) => {
    const { result, loading } = useContentful({
        content_type: "embeddingSettings",
        "fields.urlKey": `${props.settingsUrlKey}`,
        include: 1,
    });
    if (loading) {
        return null;
    }
    if (!result || result.length === 0) {
        return <h1>{props.settingsUrlKey} is not recognized.</h1>;
    }
    const settings = convertContentfulEmbeddingSettingsToIEmbedSettings(
        result[0]
    );
    if (!settings.enabled) {
        return <h1>{props.settingsUrlKey} is not enabled.</h1>;
    }

    // TODO: this only works for one level of collection.
    // If we name multiple collections, then we have to maintain that if the client adds subcollections.
    // Instead, we plan to actually walk the collection to determine its descendants.
    // Some ideas on how to do that:
    //  1) fully populate the ICollection:ChildCollections rather than just store ids
    //  2) add a "descendants" field to ICollection which just has an array of ids for us to check here.
    // tslint:disable-next-line: prefer-const
    let { collectionName } = splitPathname(props.urlSegments);

    // TODO: I only got this far with the useDefaultCollection idea... we would actually have to pass this
    // to our child *and* change the current window url
    // if (useDefaultCollection) {
    //     collectionName = settings.collectionUrlKey;
    // }

    if (collectionName !== settings.collectionUrlKey) {
        return (
            <h1>
                {`Mismatch between the embed settings, ${settings.urlKey} which is for ${settings.collectionUrlKey}, and ${collectionName}.`}
            </h1>
        );
    }
    /* This was a good idea but we're not allowed, from an iframe, to know the host domain.
    Note: if we *really* had to do this, there is X-Frame-Options ALLOW-FROM http://example.com/,
    But that would seem to require making a separate S3 bucket, with this HTTP header, for each
    embedding site.

    if (
        (!settings.domain ||
            !["localhost", settings.domain].includes(
                window.top.location.hostname
            )) &&
        !window.top.location.hostname.endsWith("bloomlibrary.org") //for ease of testing
    ) {
        return (
            <h1>
                {settings.domain} does not match {window.top.location.hostname}.
            </h1>
        );
    }
    */
    return (
        <CollectionWrapper
            segments={props.urlSegments}
            embeddedSettings={settings}
        />
    );
};

// If this iframe has the necessary javascript loaded, this will allow visitors to be able to share, bookmark locations within the library, or
// refresh without losing their place. See the the other end of this code at testembed.htm
export function useSetEmbeddedUrl() {
    const location = useLocation();
    useEffect(() => {
        let bloomLibraryLocation = location.pathname.substring(1);
        if (!location.pathname.startsWith("/player/")) {
            const { collectionName, breadcrumbs } = splitPathname(
                location.pathname
            );
            const p = breadcrumbs;
            p.push(collectionName);
            bloomLibraryLocation = p.join("/");
        }
        window.parent.postMessage(
            {
                event: "addBloomLibraryLocationToUrl",
                data: bloomLibraryLocation, // nb: the receiver already encodes this
            },
            "*"
        );
    }, [location]);
}
