import React, { useEffect } from "react";
import { useContentful } from "../connection/UseContentful";
import { convertContentfulEmbeddingSettingsToIEmbedSettings } from "../model/Contentful";
import { splitPathname, CollectionWrapper } from "./Routes";
import { useLocation } from "react-router-dom";

// Note, there is a Storybook story for testing this in an iframe.
// This relies on a matching Contentful "Embedded Settings".
// At the time of this writing, you can also test this with localhost:3000/test-embedding/sil-lead
export const EmbeddingHost: React.FunctionComponent<{
    urlSegments: string;
}> = (props) => {
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const domain = query.get("bl-domain");

    const response1 = useContentful({
        content_type: "domainEmbeddingSettings",
        "fields.domain": domain,
        include: 1,
    });

    // tslint:disable-next-line: prefer-const
    let { collectionName, embeddedSettingsUrlKey } = splitPathname(
        props.urlSegments
    );
    const { result, loading } = useContentful({
        content_type: "embeddingSettings",
        "fields.urlKey": embeddedSettingsUrlKey,
        include: 1,
    });

    // First, check if embedding is allowed based on domainEmbeddingSettings
    if (response1.loading) {
        return null;
    }
    if (doesDomainAllowEmbedding(collectionName, response1.result)) {
        return <CollectionWrapper segments={props.urlSegments} />;
    }

    // Nope, not allowed via domainEmbeddingSettings.
    // Try the older logic and see if it's allowed
    if (loading) {
        return null;
    }
    if (!result || result.length === 0) {
        return <h1>Embedded is not supported for {embeddedSettingsUrlKey}</h1>;
    }
    const settings = convertContentfulEmbeddingSettingsToIEmbedSettings(
        result[0]
    );
    if (!settings.enabled) {
        return <h1>{embeddedSettingsUrlKey} is not enabled.</h1>;
    }

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

    return (
        <CollectionWrapper
            segments={props.urlSegments}
            embeddedSettings={settings}
        />
    );

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
};

// Returns true if embedding is allowed for the domain.
function doesDomainAllowEmbedding(
    collectionName: string, // The name of the collection for which we are checking if embedding is allowed.
    result: any[] | undefined // the result from a useContentful call to check the domainEmbedSettings
): boolean {
    if (result && result.length >= 1) {
        // Check collectionUrlKeys and check if we match a pattern
        // If collectionUrlKeys is empty, allow any pattern
        const collectionUrlKeys = (result[0].fields["collectionUrlKeys"] ||
            "*") as string;

        const patterns = collectionUrlKeys.split(",");

        for (let i = 0; i < patterns.length; ++i) {
            const pattern = patterns[i].trim();
            if (doesNameMatchPattern(collectionName, pattern)) {
                return true;
            }
        }
    }

    return false;
}

// Checks if the collection name matches the pattern.
// pattern matching is case insensitive.
// The pattern needs to match the full collection name, but you can use "*" wildcards
export function doesNameMatchPattern(
    collectionName: string,
    pattern: string
): boolean {
    // pattern "cat-and-dog*" should match things beginning with "cat-and-dog"
    // pattern "Look-Listen-Live" should match only that.
    // In order for that to work, we need the ^ and $ beginning/end anchors.
    const regexPattern = "^" + pattern.replace("*", ".*") + "$";
    const regex = new RegExp(regexPattern, "i"); // case insensitive
    return regex.test(collectionName);
}

// If this iframe has the necessary javascript loaded, this will allow visitors to be able to share, bookmark locations within the library, or
// refresh without losing their place. See the the other end of this code at testembed.htm
export function useSetEmbeddedUrl() {
    const location = useLocation();
    useEffect(() => {
        let bloomLibraryLocation =
            location.pathname.substring(1) + location.search;
        const {
            collectionName,
            breadcrumbs,
            bookId,
            isPlayerUrl,
        } = splitPathname(location.pathname);
        let p = [...breadcrumbs];
        if (bookId) {
            if (isPlayerUrl) {
                // make sure no breadcrumbs, can't handle with player
                p = [];
            }
            p.push(isPlayerUrl ? "player" : "book");
            p.push(bookId);
        } else {
            p.push(collectionName);
        }
        bloomLibraryLocation = p.join("/") + location.search;
        window.parent.postMessage(
            {
                event: "addBloomLibraryLocationToUrl",
                data: bloomLibraryLocation, // nb: the receiver already encodes this
            },
            "*"
        );
    }, [location]);
}

// Currently this doesn't need to be a 'use' but I made it that way in case the
// algorithm changes.
export function useIsEmbedded(): boolean {
    return isEmbedded();
}

// For contexts where we currently can't readily do useIsEmbedded(). We'll have to fix these if the
// algorithm changes.
export function isEmbedded(): boolean {
    return window.self !== window.top;
}
