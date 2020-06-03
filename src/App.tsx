// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";

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
import { Header } from "./components/header/Header";
import BookDetail from "./components/BookDetail/BookDetail";
import { ReadBookPage } from "./components/ReadBookPage";
import { CollectionSubsetPage } from "./components/CollectionSubsetPage";
import { ContentfulBanner } from "./components/banners/ContentfulBanner";
import { ContentfulContext } from "./ContentfulContext";
import { CollectionPage } from "./components/CollectionPage";
import { Footer } from "./components/Footer";
import { ContentfulPage } from "./components/ContentfulPage";

interface ICachedTables {
    tags: string[];
    languagesByBookCount: ILanguage[];
    bookshelves: IBookshelfResult[];
}
// for use when we aren't in a react context with hooks
export const CachedTables: ICachedTables = {
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
};

export const CachedTablesContext = React.createContext<ICachedTables>({
    tags: [],
    languagesByBookCount: [],
    bookshelves: [],
});

export const App: React.FunctionComponent<{}> = (props) => {
    const tags = useGetTagList();
    const languagesByBookCount = useGetCleanedAndOrderedLanguageList();
    const bookshelves = useGetBookshelvesByCategory();
    CachedTables.bookshelves = bookshelves;
    CachedTables.tags = tags;
    CachedTables.languagesByBookCount = languagesByBookCount;

    // const embeddedMode = window.location.hostname
    //     .toLowerCase()
    //     .startsWith("embed");
    const embeddedMode = window.self !== window.top;

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
                            languagesByBookCount,
                            bookshelves,
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
                                <Router>
                                    {embeddedMode || <Header />}
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
                                                        <ContentfulBanner
                                                            id={match.params.id}
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
                                        <Route
                                            path="/grid/:filter*"
                                            render={({ match }) => {
                                                return (
                                                    <GridPage
                                                        filters={
                                                            match.params.filter
                                                        }
                                                    />
                                                );
                                            }}
                                        />
                                        <Route
                                            exact={true}
                                            path={["/", "/read"]}
                                        >
                                            <CollectionPage
                                                collectionName="root.read"
                                                breadcrumbs={[]}
                                            />
                                        </Route>
                                        <Route exact={true} path={"/create"}>
                                            <CollectionPage
                                                collectionName="create"
                                                breadcrumbs={[]}
                                            />
                                        </Route>
                                        <Route path="/bulk">
                                            <BulkEditPage />
                                        </Route>
                                        <Route
                                            path="/page/:lineage/"
                                            render={({ match }) => {
                                                return (
                                                    <ContentfulPage
                                                        urlKey={getCollectionName(
                                                            match.params.lineage
                                                        )}
                                                    />
                                                );
                                            }}
                                        />
                                        <Route
                                            path="/:collectionNames/:filter*"
                                            render={({ match }) => {
                                                const filterParam =
                                                    match.params.filter || "";
                                                const filters = filterParam.split(
                                                    "/"
                                                );
                                                const breadcrumbs = match.params.collectionNames.split(
                                                    "~"
                                                );
                                                const collectionName =
                                                    breadcrumbs[
                                                        breadcrumbs.length - 1
                                                    ] || "";
                                                breadcrumbs.pop(); // remove current collection name
                                                // Don't want leading root.read in breadcrumbs; home is automatically included.
                                                if (
                                                    breadcrumbs[0] ===
                                                    "root.read"
                                                ) {
                                                    breadcrumbs.splice(0, 1);
                                                }
                                                // This heuristic will probably change. Basically this is the route
                                                // for displaying top-level collections.
                                                if (filterParam.length === 0) {
                                                    return (
                                                        <CollectionPage
                                                            collectionName={
                                                                collectionName
                                                            }
                                                            breadcrumbs={
                                                                breadcrumbs
                                                            }
                                                            embeddedMode={
                                                                embeddedMode
                                                            }
                                                        />
                                                    );
                                                }
                                                return (
                                                    <CollectionSubsetPage
                                                        collectionName={
                                                            collectionName
                                                        }
                                                        filters={
                                                            match.params.filter
                                                        }
                                                    />
                                                );
                                            }}
                                        ></Route>
                                    </Switch>
                                </Router>
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

// We make breadcrumbs work by putting the history we want in the form of
// something~otherthing~whereWeAreNow. Only the last thing is used for our actual
// location, all the other parts of this "lineage" are just used for breadcrumbs.
function getCollectionName(listOfTildeSeparatedNames: string): string {
    const parts = listOfTildeSeparatedNames.split("~");
    return parts[parts.length - 1] || "";
}

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
