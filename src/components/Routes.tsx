// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { GridPage } from "./Grid/GridPage"; // internally lazy
import { BulkEditPageCodeSplit } from "./BulkEdit/BulkEditPageCodeSplit";
import { BookDetailCodeSplit } from "./BookDetail/BookDetailCodeSplit";
import { ReadBookPageCodeSplit } from "./ReadBookPageCodeSplit";
import { CollectionSubsetPage } from "./CollectionSubsetPage";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import { CollectionPage } from "./CollectionPage";
import { FooterCodeSplit } from "./FooterCodeSplit";
import { ContentfulPage } from "./pages/ContentfulPage";
import { getDummyCollectionForPreview } from "../model/Collections";
import { ErrorBoundary } from "./ErrorBoundary";
import { IEmbedSettings } from "../model/ContentInterfaces";
import { EmbeddingHost, isEmbedded, useSetEmbeddedUrl } from "./EmbeddingHost";
import { CollectionStatsPageCodeSplit } from "./statistics/CollectionStatsPageCodeSplit";
import { TestEmbeddingPage } from "./TestEmbedding";
import { ThemeForLocation } from "./pages/ThemeForLocation";
import { CollectionReportSplit } from "./reports/CollectionReportSplit";
import { AppHostedLanguageGroup } from "./appHosted/AppHostedLanguageGroup";
import { AppHostedDownloadingPage } from "./appHosted/AppHostedDownloadingPage";
import { appHostedSegment, isAppHosted } from "./appHosted/AppHostedUtils";
import { LanguageReport } from "./statistics/LanguageReport";
import { LoginForEditor } from "./User/LoginForEditor";

export let previousPathname = "";
let currentPathname = "";

// The main set of switches that loads different things into the main content area of Blorg
// based on the current window location.
export const Routes: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    useSetEmbeddedUrl();
    const { pathname, hash } = useLocation();

    // Hack to allow links from outside Blorg to point to anchors within Blorg.
    // Adapted from https://stackoverflow.com/questions/40280369/use-anchors-with-react-router.
    useEffect(() => {
        if (hash === "") {
            // if not a hash link, scroll to top
            // Might sometimes be useful, especially if pathname changes, but I don't think we want it always.
            //window.scrollTo(0, 0);
        } else {
            // scroll to id. We may not yet have rendered the element that has that ID, so we may need to wait a bit.
            const id = hash.replace("#", "");
            let maxTry = 20;
            const tryToScrollToId = () => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView();
                } else {
                    if (maxTry-- > 0) {
                        setTimeout(tryToScrollToId, 100);
                    }
                }
            };
            setTimeout(tryToScrollToId, 0);
        }
    }, [pathname, hash]); // do this on route change

    if (currentPathname !== location.pathname) {
        previousPathname = currentPathname;
        currentPathname = location.pathname;
    }

    return (
        <ErrorBoundary url={location.pathname}>
            <ThemeForLocation browserTabTitle={location.pathname}>
                <Switch>
                    <Route
                        path="/test-embedding/:code*"
                        render={({ match }) => {
                            return (
                                <TestEmbeddingPage code={match.params.code} />
                            );
                        }}
                    ></Route>

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
                                <FooterCodeSplit />
                            </React.Fragment>
                        )}
                    ></Route>
                    <Route
                        path="/:breadcrumbs*/book/:id"
                        render={({ match }) => {
                            return <BookDetailCodeSplit id={match.params.id} />;
                        }}
                    />
                    <Route
                        path="/player/:id"
                        render={({ match }) => {
                            return (
                                <ReadBookPageCodeSplit id={match.params.id} />
                            );
                        }}
                    />
                    <Route
                        path="/login-for-editor"
                        render={() => {
                            return <LoginForEditor />;
                        }}
                    />
                    <Route
                        path={"/" + appHostedSegment + "/langs"}
                        render={({ match }) => {
                            return <AppHostedLanguageGroup />;
                        }}
                    ></Route>
                    <Route
                        path={"/" + appHostedSegment + "/downloading"}
                        render={({ match }) => {
                            return <AppHostedDownloadingPage />;
                        }}
                    ></Route>
                    {/* We no longer use this route, but it's here in case we need to redirect user bookmarks.
                        Note, the original links were /create/release-notes/{channel} but this handles any suffix. */}
                    <Route
                        path="*/release-notes"
                        component={() => {
                            window.location.replace(
                                "https://docs.bloomlibrary.org/Release-Notes"
                            );
                            return null;
                        }}
                    />
                    <Route
                        path="/language-report"
                        render={({ match }) => {
                            return <LanguageReport />;
                        }}
                    />
                    <Route
                        path="/grid/:filter*"
                        render={({ match }) => {
                            return <GridPage filters={match.params.filter} />;
                        }}
                    />
                    <Route
                        path="/bulk/:filter*"
                        render={({ match }) => {
                            return (
                                <BulkEditPageCodeSplit
                                    filters={match.params.filter}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/page/:breadcrumbs*/:pageName"
                        render={({ match }) => {
                            return (
                                <ContentfulPage
                                    urlKey={match.params.pageName}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/_preview/page/:pageName"
                        render={({ match }) => {
                            return (
                                <ContentfulPage
                                    urlKey={match.params.pageName}
                                />
                            );
                        }}
                    />

                    <Route
                        path={"/:segments*/stats/:screen*"}
                        render={({ match }) => {
                            if (window.self !== window.top) {
                                throw new Error(
                                    "Stats not available in embedding."
                                );
                            }
                            const { collectionName, filters } = splitPathname(
                                match.params.segments
                            );
                            return (
                                <CollectionStatsPageCodeSplit
                                    collectionName={collectionName}
                                    filters={filters}
                                    screen={match.params.screen}
                                />
                            );
                        }}
                    ></Route>
                    <Route
                        path={"/:segments*/report"}
                        render={({ match }) => {
                            if (window.self !== window.top) {
                                throw new Error(
                                    "Report not available in embedding."
                                );
                            }
                            const { collectionName } = splitPathname(
                                match.params.segments
                            );
                            return (
                                <CollectionReportSplit
                                    collectionName={collectionName}
                                />
                            );
                        }}
                    ></Route>

                    {/* We might as well put some of these lesser-used ones toward the bottom for efficiency... */}
                    <Route
                        exact
                        path={[
                            "/browse", // Alias from legacy blorg
                            "/landing", // Alias from legacy blorg
                            "/books", // One of the links from BloomDesktop goes here
                        ]}
                    >
                        <Redirect to="/" />
                    </Route>
                    <Route
                        exact
                        path={[
                            "/download", // Alias from legacy blorg
                            "/downloads", // Alias for convenience when telling people where to get Bloom
                            "/installers", // Alias from legacy blorg
                        ]}
                    >
                        <Redirect to="/page/create/downloads" />
                    </Route>
                    {/* Alias from legacy blorg */}
                    <Redirect from={"/browse/detail/:id"} to="/book/:id" />
                    {/* Alias from legacy blorg */}
                    <Redirect from={"/readBook/:id"} to="/player/:id" />
                    {/* We have published this artofreading link in various places (like the WeSay page) */}
                    <Route path={["/artofreading"]}>
                        <Redirect to="/page/create/page/art-of-reading" />
                    </Route>
                    {/* Alias from legacy blorg */}
                    <Redirect from={"/about"} to="/page/create/about" />
                    {/* Alias from legacy blorg */}
                    <Redirect
                        from={"/bloom-reader-privacy-policy"}
                        to="/page/create/bloom-reader-privacy-policy"
                    />
                    {/* Alias from legacy blorg */}
                    <Route path="/sponsorship">
                        <ContentfulPage urlKey="sponsorship" />
                    </Route>

                    {/* Aliases from BloomDesktop */}
                    <Redirect from="/support" to="/page/support" />
                    <Redirect from="/terms" to="/page/termsOfUse" />
                    {/* Note, because of the special handling required here for hashes
                    (the router doesn't match paths based on hash),
                    we handle the home page in this route because the path is "/" */}
                    <Route
                        exact
                        strict
                        path={"/"}
                        render={({ match }) => {
                            if (location.hash?.startsWith("#/browse/detail/")) {
                                return (
                                    <Redirect
                                        to={
                                            "/book/" +
                                            location.hash.substr(
                                                "#/browse/detail/".length
                                            )
                                        }
                                    />
                                );
                            }
                            switch (location.hash) {
                                case "#/terms":
                                    return (
                                        <ContentfulPage urlKey="termsOfUse" />
                                    );
                                case "#/artofreading":
                                    return (
                                        <Redirect to="/page/create/page/art-of-reading" />
                                    );
                                default:
                                    return (
                                        <DefaultRouteComponent
                                            locationPathname={location.pathname}
                                            segments={match.params.segments}
                                        />
                                    );
                            }
                        }}
                    ></Route>

                    {/* Must come last, this matches anything else */}
                    <Route
                        path={"/:segments*"}
                        render={({ match }) => (
                            <DefaultRouteComponent
                                locationPathname={location.pathname}
                                segments={match.params.segments}
                            />
                        )}
                    ></Route>
                </Switch>
            </ThemeForLocation>
        </ErrorBoundary>
    );
};

// The fallthrough/default component when a route doesn't match something else.
export const DefaultRouteComponent: React.FunctionComponent<{
    locationPathname: string;
    segments: string;
}> = (props) => {
    if (window.self !== window.top) {
        return (
            <EmbeddingHost urlSegments={props.locationPathname}></EmbeddingHost>
        );
    }
    return <CollectionWrapper segments={props.segments}></CollectionWrapper>;
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
    bookId: string;
    isPlayerUrl: boolean;
    isPageUrl: boolean;
} {
    const segments = trimLeft(pathname ?? "", "/").split("/");
    let isPlayerUrl = false;
    const isPageUrl = segments[0] === "page";

    // these two variables move roughly in sync, however, firstFilterIndex
    // (if less than collection length) is always exactly the index of the
    // first thing starting with a colon (after this loop exits).
    // collectionSegmentIndex gets adjusted in various special cases, so it
    // does not always stay the index of the last segment with no colon.
    let collectionSegmentIndex = segments.length - 1;
    let firstFilterIndex = segments.length;
    while (collectionSegmentIndex >= 0) {
        if (!segments[collectionSegmentIndex].startsWith(":")) {
            break;
        }
        firstFilterIndex = collectionSegmentIndex;
        collectionSegmentIndex--;
    }
    let collectionName = segments[collectionSegmentIndex];
    let bookId = "";

    if (
        collectionSegmentIndex < 0 ||
        collectionName === "read" ||
        !collectionName
    ) {
        // all segments (if any) are filters! We're in the root collection.
        collectionName = "root.read";
    }
    if (collectionSegmentIndex >= 1) {
        const previous = segments[collectionSegmentIndex - 1];
        if (previous === "player") {
            isPlayerUrl = true;
            collectionName = ""; // we have no way of knowing it, but it's not the book ID.
            bookId = segments[collectionSegmentIndex];
            collectionSegmentIndex--; // "player" is not a breadcrumb
        }
        if (previous === "book") {
            collectionName =
                collectionSegmentIndex >= 2
                    ? segments[collectionSegmentIndex - 2]
                    : "";
            bookId = segments[collectionSegmentIndex];
            collectionSegmentIndex--; // "book" is not a breadcrumb
        }
    }

    const embeddedSettings = isEmbedded() ? "embed-" + collectionName : "";

    return {
        embeddedSettingsUrlKey: embeddedSettings,
        collectionName,
        filters: segments.slice(firstFilterIndex).map((x) => x.substring(1)),
        breadcrumbs: segments.slice(0, Math.max(collectionSegmentIndex, 0)),
        bookId,
        isPlayerUrl,
        isPageUrl,
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
// We might also be going a level of filter deeper; for example, from location
// /enabling-writers/ew-nigeria/:level:1 to target ew-nigeria/:level:1/:topic:Agriculture
// producing enabling-writers/ew-nigeria/:level:1/:topic:Agriculture.
// Any leading slash on target should be ignored.
// See https://docs.google.com/document/d/1cA9-9tMSydZ6Euo-hKmdHo_JlO0aLW8Fi9v293oIHK0/edit#heading=h.3b7gegy9uie8
// for more of the logic.
export function getUrlForTarget(target: string) {
    if (target.startsWith("http")) return target;

    const { breadcrumbs, collectionName: pathCollectionName } = splitPathname(
        window.location.pathname
    );
    let segments = [...breadcrumbs];

    const { collectionName, isPageUrl } = splitPathname(target);
    if (isPageUrl) {
        segments.push("page");
    }
    if (pathCollectionName && collectionName !== pathCollectionName) {
        segments.push(pathCollectionName);
    }
    const trimmedTarget = trimLeft(target, "/");
    if (trimmedTarget.startsWith("player/")) {
        // don't want breadcrumbs
        segments = [];
    }
    segments.push(trimmedTarget);

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

// REVIEW: I'm unsure as to what the relationship between these two ways (next two methods)
// of getting the context language iso code should be. We were already getting it from the
// two different methods in different places. For now, at least I've brought them together in
// one place and made the names explicit so the caller knows exactly what it's getting.

export function getContextLangTagFromLanguageSegment(urlKey: string) {
    return urlKey.startsWith("language:")
        ? // we don't want anything after a slash as part of the isoCode
          urlKey.substring("language:".length).split("/")[0]
        : undefined;
}

export function getContextLangTagFromUrlSearchParams(
    query: URLSearchParams
): string | undefined {
    const lang = query.get("lang");
    if (lang) {
        return lang;
    }
    return undefined;
}

export function useSetBrowserTabTitle(title: string | undefined) {
    const location = useLocation();
    useEffect(() => {
        if (!title) {
            document.title = "Loading...";
        } else {
            // When app-hosted, we often have different titles we want to show.
            // Currently, those are being implemented using Helmet.
            // At least in one case, this code was running after Helmet had set the title;
            // thus the wrong title was being shown.
            if (isAppHosted()) return;

            // When trying to properly set the title of LoginForEditor, I couldn't get it
            // to work consistently because the call to useSetBrowserTabTitle in ThemeForLocation
            // was coming behind it and setting the title to "/login-for-editor".
            // So that's the use case I'm fixing, but it seems we don't ever want to set the title
            // to "/something".
            if (title.startsWith("/")) return;

            // we support titles coming in from the URL to support book playback
            // (I'm not sure why that's different, but it is).
            const urlParams = new URLSearchParams(location.search);

            // urlParams.get() automatically decodes it for us.
            // Be careful not to decode it again. Applying decoding multiple times can change the result
            // (possibly generating invalid URLs), especially if the title contains '%' characters.
            const titleFromUrl = urlParams.get("title");
            setBloomLibraryTitle(titleFromUrl ? titleFromUrl : title);
        }
    }, [title, location]);
}

// This is used where we can't use useDocumentTitle, typically because
// we don't know the title until after some conditional logic prevented by
// rules of hooks.
// Note: some components instead use <Helmet> to set document title and other metadata.
export function setBloomLibraryTitle(title: string): void {
    document.title = "Bloom Library: " + title;
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
