// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import { GridPage } from "./Grid/GridPage";
import { BulkEditPage } from "./BulkEdit/BulkEditPage";
import BookDetail from "./BookDetail/BookDetail";
import { ReadBookPage } from "./ReadBookPage";
import { CollectionSubsetPage } from "./CollectionSubsetPage";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import { CollectionPage } from "./CollectionPage";
import { Footer } from "./Footer";
import { ContentfulPage } from "./ContentfulPage";
import { splitPathname } from "./Breadcrumbs";

// The main set of switches that loads differnt things into the main content area of Blorg
// based on the current window location.
export const Routes: React.FunctionComponent<{}> = (props) => {
    const embeddedMode = window.self !== window.top;
    return (
        <Switch>
            {/* Alias from legacy blorg */}
            <Route path={"/browse"}>
                <Redirect to="/page/create~downloads" />
            </Route>
            <Route
                path={[
                    "/downloads", // Alias for convenience when telling people where to get Bloom
                    "/installers", // Alias from legacy blorg
                ]}
            >
                <Redirect to="/page/create~downloads" />
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
                            <ContentfulBanner id={match.params.id} />
                        </div>
                        <Footer />
                    </React.Fragment>
                )}
            ></Route>
            <Route
                path="/:breadcrumbs*/book/:id"
                render={({ match }) => {
                    return <BookDetail id={match.params.id} />;
                }}
            />

            <Route path="/player/:id">
                <ReadBookPage />
            </Route>
            <Route path="/about">
                <ContentfulPage urlKey="about" />
            </Route>
            <Route
                path="/grid/:filter*"
                render={({ match }) => {
                    return <GridPage filters={match.params.filter} />;
                }}
            />
            <Route exact={true} path={["/", "/read"]}>
                <CollectionPage collectionName="root.read" />
            </Route>
            <Route exact={true} path={"/create"}>
                <CollectionPage collectionName="create" />
            </Route>
            <Route path="/bulk">
                <BulkEditPage />
            </Route>
            <Route
                path="/page/:breadcrumbs*/:pageName/"
                render={({ match }) => {
                    return <ContentfulPage urlKey={match.params.pageName} />;
                }}
            />
            <Route
                path="/:segments+"
                render={({ match }) => {
                    const { collectionName, filters } = splitPathname(
                        match.params.segments
                    );

                    // This heuristic might change. Basically this is the route
                    // for displaying top-level collections.
                    if (filters.length === 0) {
                        return (
                            <CollectionPage
                                collectionName={collectionName}
                                embeddedMode={embeddedMode}
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
                }}
            ></Route>
        </Switch>
    );
};
