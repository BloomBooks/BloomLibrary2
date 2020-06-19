// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { GridPage } from "./Grid/GridPage";
import { BulkEditPage } from "./BulkEdit/BulkEditPage";
import BookDetail from "./BookDetail/BookDetail";
import { ReadBookPage } from "./ReadBookPage";
import { CollectionSubsetPage } from "./CollectionSubsetPage";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import { CollectionPage } from "./CollectionPage";
import { Footer } from "./Footer";
import { ContentfulPage } from "./ContentfulPage";
import { getDummyCollectionForPreview } from "../model/Collections";
import { ErrorBoundary } from "./ErrorBoundary";
import { IEmbedSettings } from "../model/ContentInterfaces";
import { EmbeddingHost, useSetEmbeddedUrl } from "./EmbeddingHost";

// The main set of switches that loads different things into the main content area of Blorg
// based on the current window location.
export const Routes: React.FunctionComponent<{}> = () => {
    const location = useLocation();
    useSetEmbeddedUrl();
    return (
        <ErrorBoundary url={location.pathname}>
            <Switch>
                {/* Alias from legacy blorg */}
                <Route path={"/browse"}>
                    <Redirect to="/create" />
                </Route>
                <Route
                    path={[
                        "/downloads", // Alias for convenience when telling people where to get Bloom
                        "/installers", // Alias from legacy blorg
                    ]}
                >
                    <Redirect to="/page/create/downloads" />
                </Route>
                {/* At contentful.com, when you work on something, there is a "Preview" button
                                        which takes you to our site so you can see how your content will actually be
                                        displayed. For banners, we configured contentful to set you to this url. */}
                <Route
                    path="/_previewBanner/:id" // used by preview button when editing in contentful
                    render={({ match }) => (
                        <React.Fragment>
                            <div // simulate it being in a context that sets some margin
                                css={css`
                                    //margin: 20px;
                                    height: 500px;
                                `}
                            >
                                <ContentfulBanner
                                    id={match.params.id}
                                    collection={getDummyCollectionForPreview(
                                        match.params.id
                                    )}
                                />
                            </div>
                            <Footer />
                        </React.Fragment>
                    )}
                ></Route>
                <Route
                    path="/:prefixes*/book/:id"
                    render={({ match }) => {
                        return (
                            <BookDetail
                                id={match.params.id}
                                prefixes={match.params.prefixes}
                            />
                        );
                    }}
                />

                <Route
                    path="/player/:id/:language?"
                    render={({ match }) => {
                        return (
                            <ReadBookPage
                                id={match.params.id}
                                contextLangIso={match.params.language}
                            />
                        );
                    }}
                />
                <Route path="/about">
                    <ContentfulPage urlKey="about" />
                </Route>
                <Route
                    path="/grid/:filter*"
                    render={({ match }) => {
                        return <GridPage filters={match.params.filter} />;
                    }}
                />

                <Route path="/bulk">
                    <BulkEditPage />
                </Route>
                <Route
                    path="/page/:breadcrumbs*/:pageName"
                    render={({ match }) => {
                        return (
                            <ContentfulPage urlKey={match.params.pageName} />
                        );
                    }}
                />
                <Route
                    path={"/embed/:embedSettings/:segments*"}
                    render={({ match, location }) => {
                        return (
                            <EmbeddingHost
                                settingsUrlKey={match.params.embedSettings}
                                urlSegments={location.pathname}
                            ></EmbeddingHost>
                        );
                    }}
                ></Route>

                {/* Must come last, this matches anything, including the home path with nothing at all. */}
                <Route
                    path={"/:segments*"}
                    render={({ match }) => {
                        if (window.self !== window.top) {
                            throw new Error(
                                "Embedding is only possible with an embed-* path."
                            );
                        }
                        return (
                            <CollectionWrapper
                                segments={match.params.segments}
                            ></CollectionWrapper>
                        );
                    }}
                ></Route>
            </Switch>
        </ErrorBoundary>
    );
};

// Given a pathname like /enabling-writers/ew-nigeria/:level:1/:topic:Agriculture/:search:dogs,
// produces {collectionName: "ew-nigeria" filters: ["level:1", "topic:Agriculture", "search:dogs"],
// breadcrumbs: ["enabling-writers"]}.
// The collection name is the last segment with no leading colon.
// The filters are all the following things that do have leading colons, minus the colons.
// The breadcrumbs are the things before the collectionName (not counting an empty string before the first slash)
// Special cases:
// - pathname is undefined, or possibly empty or a single slash: happens when there's no pathname at all:
//       collectionName is root.read, others results are empty
// - everything is a filter: collectionName is root.read
// - collection works out to "read": change to "root.read"
export function splitPathname(
    pathname: string
): {
    embeddedSettingsUrlKey: string | undefined;
    collectionName: string;
    filters: string[];
    breadcrumbs: string[];
} {
    const segments = trimLeft(pathname ?? "", "/").split("/");
    let embeddedSettings;
    if (segments.length > 1 && segments[0] === "embed") {
        embeddedSettings = segments[1];
        segments.splice(0, 2);
    }
    let collectionSegmentIndex = segments.length - 1;
    while (collectionSegmentIndex >= 0) {
        if (!segments[collectionSegmentIndex].startsWith(":")) {
            break;
        }
        collectionSegmentIndex--;
    }
    let collectionName = segments[collectionSegmentIndex];

    if (
        collectionSegmentIndex < 0 ||
        collectionName === "read" ||
        !collectionName
    ) {
        // all segments (if any) are filters! We're in the root collection.
        collectionName = "root.read";
    }

    return {
        embeddedSettingsUrlKey: embeddedSettings,
        collectionName,
        filters: segments
            .slice(collectionSegmentIndex + 1)
            .map((x) => x.substring(1)),
        breadcrumbs: segments.slice(0, Math.max(collectionSegmentIndex, 0)),
    };
}

// what we're calling "target" is the last part of url, where the url is <breadcrumb stuff>/<target>
// Thus, it is the shortest URL that identifies the collection and filters that we want,
// without a leading slash.
// This function is called when the collection indicated by the current location pathname
// is considered to be a parent of target, so we want a URL that indicates the target collection,
// but uses the current location pathname collection as breadcrumbs.
// It's possible that it is a true child collection; for example, if current pathname is
// /enabling-writers and target is ew-nigeria, we want enabling-writers/ew-nigeria.
// It's also possible that we're moving to a filtered subset collection; for example, if
// the current pathname is /enabling-writers/ew-nigeria and target is ew-nigeria/:level:1
// We want to get enabling-writers/ew-nigeria/:level:1 (only one ew-nigeria).
// We might also be going a level of fiter deeper; for example, from location
// /enabling-writers/ew-nigeria/:level:1 to target ew-nigeria/:level:1/:topic:Agriculture
// producing enabling-writers/ew-nigeria/:level:1/:topic:Agriculture.
// Any leading slash on target should be ignored.
// See https://docs.google.com/document/d/1cA9-9tMSydZ6Euo-hKmdHo_JlO0aLW8Fi9v293oIHK0/edit#heading=h.3b7gegy9uie8
// for more of the logic.
export function getUrlForTarget(target: string) {
    const {
        embeddedSettingsUrlKey,
        breadcrumbs,
        collectionName: pathCollectionName,
    } = splitPathname(window.location.pathname);
    const segments = [
        embeddedSettingsUrlKey ? "embed" : undefined,
        embeddedSettingsUrlKey,
        ...breadcrumbs,
    ].filter((s) => !!s);

    const { collectionName } = splitPathname(target);
    if (pathCollectionName && collectionName !== pathCollectionName) {
        segments.push(pathCollectionName);
    }
    segments.push(trimLeft(target, "/"));
    // NB: we do not expect to get any of these in combination with /embed/
    if (
        segments[0] === "root.read" ||
        segments[0] === "read" ||
        segments[0] === ""
    ) {
        segments.splice(0, 1);
    }
    return segments.join("/");
}
function trimLeft(s: string, char: string) {
    return s.replace(new RegExp("^[" + char + "]+"), "");
}

export function useDocumentTitle(title: string | undefined) {
    const location = useLocation();
    useEffect(() => {
        if (!title) {
            document.title = "Loading...";
        } else {
            // we support titles coming in from the URL to support book playback
            // (I'm not sure why that's different, but it is).
            const urlParams = new URLSearchParams(location.search);
            const titleFromUrl = urlParams.get("title");
            document.title =
                "Bloom Library: " +
                (titleFromUrl ? decodeURI(titleFromUrl) : title);
        }
    }, [title, location]);
}

export const CollectionWrapper: React.FunctionComponent<{
    segments: string;
    embeddedSettings?: IEmbedSettings;
}> = (props) => {
    const { collectionName, filters } = splitPathname(props.segments);

    // This heuristic might change. Basically this is the route
    // for displaying top-level collections.
    if (filters.length === 0) {
        return (
            <CollectionPage
                embeddedSettings={props.embeddedSettings}
                collectionName={collectionName}
            />
        );
    }
    // While this one is for filtered (subset) collections, typically from 'More' or Search
    return (
        <CollectionSubsetPage
            collectionName={collectionName}
            filters={filters}
        />
    );
};
