// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useMemo } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams,
    Redirect,
} from "react-router-dom";

import { BrowseView } from "./components/BrowseView";
import theme from "./theme";
import { ThemeProvider, Snackbar } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";
import {
    useGetTagList,
    useGetCleanedAndOrderedLanguageList,
    IBookshelfResult,
    useGetBookshelvesByCategory,
} from "./connection/LibraryQueryHooks";
import { ILanguage } from "./model/Language";
import {
    OSFeaturesContext,
    bloomDesktopAvailable,
    bloomReaderAvailable,
    cantUseBloomD,
} from "./components/OSFeaturesContext";
import { Alert, AlertTitle } from "@material-ui/lab";

import { GridPage } from "./components/Grid/GridPage";
import { BulkEditPage } from "./components/BulkEdit/BulkEditPage";
import { HomeGrownRouter, RouterContext } from "./Router";
import { Header } from "./components/header/Header";
import BookDetail from "./components/BookDetail/BookDetail";
import { HomePage } from "./components/HomePage";
import { ReadBookPage } from "./components/ReadBookPage";
import {
    LanguagePage,
    CategoryPageWithDefaultLayout,
    CategoryPageForBookshelf,
    DefaultOrganizationPage,
    ProjectPageWithDefaultLayout,
    AllResultsPage,
} from "./components/Pages";
import { BiblePage } from "./components/BiblePage";
import { FeaturePage } from "./components/FeaturePage";
import { Covid19Page } from "./components/Covid19Page";
import { ByLevelPage } from "./components/PublisherPages";
import { GuatemalaMOEPage } from "./components/banners/OrganizationCustomizations";
import { forceCheck as forceCheckLazyLoadComponents } from "react-lazyload";
import { EnablingWritersPage } from "./components/EnablingWritersPage";
import { WycliffePage } from "./components/WycliffePage";
import { SILLEADPage } from "./components/SILLEADPage";
import { ICollection, getCollections } from "./model/Collections";
import { makeCollectionForLevel } from "./components/LevelGroups";
import { ContentfulBanner } from "./components/banners/ContentfulBanner";
import { ContentfulContext } from "./ContentfulContext";
import { CollectionPage } from "./components/CollectionPage";
import { Footer } from "./components/Footer";
import { RowOfPageCardsForKey } from "./components/RowOfPageCards";
import { ContentfulPage } from "./components/ContentfulPage";

interface ICachedTables {
    tags: string[];
    languagesByBookCount: ILanguage[];
    bookshelves: IBookshelfResult[];
    collections: Map<string, ICollection>;
}
// for use when we aren't in a react context with hooks
export const CachedTables: ICachedTables = {
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
    collections: new Map<string, ICollection>(),
};

export const CachedTablesContext = React.createContext<ICachedTables>({
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
    collections: new Map<string, ICollection>(),
});

const homeGrownRouter = new HomeGrownRouter();

export const App: React.FunctionComponent<{}> = (props) => {
    const tags = useGetTagList();
    const languagesByBookCount = useGetCleanedAndOrderedLanguageList();
    const bookshelves = useGetBookshelvesByCategory();
    CachedTables.bookshelves = bookshelves;
    CachedTables.tags = tags;
    CachedTables.languagesByBookCount = languagesByBookCount;
    const collections = useMemo(() => getCollections(bookshelves), [
        bookshelves,
    ]);
    // tslint:disable-next-line: no-object-literal-type-assertion

    return (
        <>
            {/* <React.StrictMode>
                    In StrictMode,
                        * react-image 2.3.0 makes this complain about UNSAFE_componentWillReceiveProps
                        * react-lazyload 2.6.5 makes it complain about finDomNode
                    These then make it hard to notice new errors, it can be very hard to figure
                    out what component is causing the problem if you don't notice it close to the time
                    that the error was introduced. So I'm disabling this for now... would be nice to
                    enable it once in while and make sure no other problems have snuck in. Eventually
                    the above libraries should catch up, or we could switch to ones that do.

                    Note, we still wrap any sections that don't have any non-strict children in <React.StrictMode>.

                    See also https://github.com/facebook/react/issues/16362
            */}
            <div className="App">
                <ThemeProvider theme={theme}>
                    <CachedTablesContext.Provider
                        value={{
                            tags,
                            languagesByBookCount: languagesByBookCount,
                            bookshelves,
                            collections: getCollections(bookshelves),
                        }}
                    >
                        <OSFeaturesContext.Provider
                            value={{
                                bloomDesktopAvailable,
                                bloomReaderAvailable,
                                cantUseBloomD,
                            }}
                        >
                            {window.location.hostname === "localhost" || (
                                <UnderConstruction />
                            )}
                            <ContentfulContext>
                                <RouterContext.Provider value={homeGrownRouter}>
                                    <Router>
                                        <Header />
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
                                            <Route
                                                path="/_previewBanner/:id"
                                                render={({ match }) => (
                                                    <React.Fragment>
                                                        <div // simulate it being in a context that sets some margin
                                                            css={css`
                                                                //margin: 20px;
                                                                height: 500px;
                                                            `}
                                                        >
                                                            <ContentfulBanner
                                                                id={
                                                                    match.params
                                                                        .id
                                                                }
                                                            />
                                                        </div>
                                                        <Footer />
                                                    </React.Fragment>
                                                )}
                                            ></Route>
                                            <Route path="/book/:id">
                                                <BookDetail />
                                            </Route>
                                            <Route path="/player/:id">
                                                <ReadBookPage />
                                            </Route>
                                            <Route path="/about">
                                                <ContentfulPage urlKey="about" />
                                            </Route>
                                            <Route path="/grid">
                                                <GridPage />
                                            </Route>
                                            <Route
                                                exact={true}
                                                path={["/", "/read"]}
                                            >
                                                <CollectionPage
                                                    collectionNames="root.read"
                                                    filters=""
                                                />
                                            </Route>
                                            <Route
                                                exact={true}
                                                path={"/create"}
                                            >
                                                <CollectionPage
                                                    collectionNames="create"
                                                    filters=""
                                                />
                                            </Route>
                                            <Route path="/bulk">
                                                <BulkEditPage />
                                            </Route>
                                            <Route
                                                path="/language/:langCode"
                                                render={({ match }) => (
                                                    <LanguagePage
                                                        langCode={
                                                            match.params
                                                                .langCode
                                                        }
                                                    />
                                                )}
                                            ></Route>
                                            <Route
                                                path="/topic/:topicName/:title?"
                                                render={({ match }) => (
                                                    <CategoryPageWithDefaultLayout
                                                        title={
                                                            match.params
                                                                .title ||
                                                            match.params
                                                                .topicName
                                                        }
                                                        filter={{
                                                            topic:
                                                                match.params
                                                                    .topicName,
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/publisher/:name"
                                                render={({ match }) => {
                                                    switch (match.params.name) {
                                                        // review: is this used, or can we get rid of this whole route?
                                                        default:
                                                            return (
                                                                <DefaultOrganizationPage
                                                                    fullBookshelfKey={
                                                                        match
                                                                            .params
                                                                            .name
                                                                    }
                                                                />
                                                            );
                                                    }
                                                }}
                                            />
                                            <Route
                                                path="/project/:fullBookshelfKey*"
                                                render={({ match }) => {
                                                    switch (
                                                        match.params
                                                            .fullBookshelfKey
                                                    ) {
                                                        case "Enabling Writers Workshops":
                                                            return (
                                                                <EnablingWritersPage />
                                                            );
                                                        case "Bible":
                                                            return (
                                                                <BiblePage />
                                                            );
                                                        default:
                                                            return (
                                                                <ProjectPageWithDefaultLayout
                                                                    fullBookshelfKey={
                                                                        match
                                                                            .params
                                                                            .fullBookshelfKey
                                                                    }
                                                                />
                                                            );
                                                    }
                                                }}
                                            />
                                            <Route
                                                path="/org/:name*"
                                                render={({ match }) => {
                                                    switch (match.params.name) {
                                                        case "Ministerio de Educación de Guatemala":
                                                            return (
                                                                <GuatemalaMOEPage />
                                                            );
                                                        case "SIL LEAD":
                                                            return (
                                                                <SILLEADPage />
                                                            );
                                                        case "Wycliffe":
                                                            return (
                                                                <WycliffePage />
                                                            );
                                                        default:
                                                            return (
                                                                <DefaultOrganizationPage
                                                                    fullBookshelfKey={
                                                                        match
                                                                            .params
                                                                            .name
                                                                    }
                                                                />
                                                            );
                                                    }
                                                }}
                                            />
                                            <Route
                                                path="/feature/:featureKey"
                                                render={({ match }) => (
                                                    <FeaturePage
                                                        featureKey={
                                                            match.params
                                                                .featureKey
                                                        }
                                                    />
                                                )}
                                            />
                                            {/* <Route path="/covid19">
                                                <Covid19Page />
                                            </Route> */}
                                            <Route
                                                path="/page/:lineage/"
                                                render={({ match }) => {
                                                    const parts = match.params.lineage.split(
                                                        "~"
                                                    );
                                                    const last =
                                                        parts[parts.length - 1];

                                                    return (
                                                        <ContentfulPage
                                                            urlKey={last}
                                                        />
                                                    );
                                                }}
                                            />
                                            <Route
                                                path="/:collectionNames/:filter+"
                                                render={({ match }) => {
                                                    const filters = match.params.filter.split(
                                                        "/"
                                                    );
                                                    if (
                                                        filters.length === 1 &&
                                                        filters[0].startsWith(
                                                            "search:"
                                                        )
                                                    ) {
                                                        return (
                                                            <CollectionPage
                                                                collectionNames={
                                                                    match.params
                                                                        .collectionNames
                                                                }
                                                                filters={
                                                                    match.params
                                                                        .filter
                                                                }
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <AllResultsPage
                                                            collectionName={
                                                                match.params
                                                                    .collectionNames
                                                            }
                                                            filters={
                                                                match.params
                                                                    .filter
                                                            }
                                                        />
                                                    );
                                                }}
                                            ></Route>
                                            <Route
                                                path="/:collectionNames/"
                                                render={({ match }) => {
                                                    return (
                                                        <CollectionPage
                                                            collectionNames={
                                                                match.params
                                                                    .collectionNames
                                                            }
                                                            filters=""
                                                        />
                                                    );
                                                }}
                                            />
                                        </Switch>
                                    </Router>
                                </RouterContext.Provider>
                            </ContentfulContext>
                        </OSFeaturesContext.Provider>
                    </CachedTablesContext.Provider>
                </ThemeProvider>
            </div>
            <LoginDialog />
            {/* </React.StrictMode> */}
        </>
    );
};

export const UnderConstruction: React.FunctionComponent<{}> = () => {
    const [open, setOpen] = React.useState(true);
    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };
    return (
        <Snackbar open={open} onClose={handleClose}>
            <Alert
                variant="filled"
                severity="info"
                elevation={6}
                onClose={handleClose}
            >
                <AlertTitle>Under Construction</AlertTitle>
                <div
                    css={css`
                        display: inline;
                    `}
                >
                    Thanks for previewing this "next" version of Bloom Library.
                    If you run into problems, head back to{" "}
                    {/* <a href="https://bloomlibrary.org">bloomlibrary.org</a> */}
                    <a
                        css={css`
                            color: white;
                        `}
                        href="https://bloomlibrary.org"
                    >
                        bloomlibrary.org
                    </a>
                </div>
            </Alert>
        </Snackbar>
    );
};

export default App;

/*  TODO

Hatton: move default card/row/banner display name to collection. Might need a "single-line label" override?
Hatton : make banner use that (in future we could provide an override on banner)
Hatton: change collection id-->key




JohnT:
Move collection name interptation into new CollectionPage.tsx
- becomes async: first see if there's a contentful page, if so retrieve it and its children, recursively.
- (later: if not use defaults, e.g. for language:ha)
- if it's a contenful page use John's new contentful banner
- (later: if not use some default banner)
- pageType becomes contentType and determines only what's below the banner
- RowOfPageCards no longer gets title, but uses title of the collection it's given. There will be a separate collection for each row, e.g., Sub-projects
-
*/
