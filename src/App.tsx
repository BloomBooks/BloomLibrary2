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
    Link,
    useRouteMatch,
    useParams,
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
import {
    ContentfulClient,
    ContentfulProvider,
    ContentfulClientInterface,
    ContentfulClientParams,
} from "react-contentful";

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
import { collections } from "./model/Collections";
import { makeCollectionForLevel } from "./components/LevelGroups";

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

const homeGrownRouter = new HomeGrownRouter();

export const App: React.FunctionComponent<{}> = (props) => {
    const tags = useGetTagList();
    const languagesByBookCount = useGetCleanedAndOrderedLanguageList();
    const bookshelves = useGetBookshelvesByCategory();
    CachedTables.bookshelves = bookshelves;
    CachedTables.tags = tags;
    CachedTables.languagesByBookCount = languagesByBookCount;
    // tslint:disable-next-line: no-object-literal-type-assertion
    const contentfulOptions: ContentfulClientParams = {
        accessToken: "XPudkny5JX74w0dxrwqS_WY3GUBA5xO_AzFR7fwO2aE",
        space: "72i7e2mqidxz",
    };
    // there's a problem with the TS types in the Contentful library, hence this "any"
    const contentfulClient = new (ContentfulClient as any)(
        contentfulOptions
    ) as ContentfulClientInterface;
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

                            <RouterContext.Provider value={homeGrownRouter}>
                                <Router>
                                    <Header />
                                    <Switch>
                                        <Route path="/book/:id">
                                            <BookDetail />
                                        </Route>
                                        <Route path="/player/:id">
                                            <ReadBookPage />
                                        </Route>
                                        <Route path="/about">
                                            <div>This is About</div>
                                        </Route>
                                        <Route path="/grid">
                                            <GridPage />
                                        </Route>
                                        <Route path="/bulk">
                                            <BulkEditPage />
                                        </Route>
                                        <Route
                                            path="/language/:langCode"
                                            render={({ match }) => (
                                                <LanguagePage
                                                    langCode={
                                                        match.params.langCode
                                                    }
                                                />
                                            )}
                                        ></Route>
                                        <Route path="/bible">
                                            <BiblePage />
                                        </Route>
                                        <Route
                                            path="/topic/:topicName/:title?"
                                            render={({ match }) => (
                                                <CategoryPageWithDefaultLayout
                                                    title={
                                                        match.params.title ||
                                                        match.params.topicName
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
                                                                    match.params
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
                                                        return <BiblePage />;
                                                    default:
                                                        return (
                                                            <ProjectPageWithDefaultLayout
                                                                fullBookshelfKey={
                                                                    match.params
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
                                                        return <SILLEADPage />;
                                                    case "Wycliffe":
                                                        return <WycliffePage />;
                                                    default:
                                                        return (
                                                            <DefaultOrganizationPage
                                                                fullBookshelfKey={
                                                                    match.params
                                                                        .name
                                                                }
                                                            />
                                                        );
                                                }
                                            }}
                                        />
                                        <Route
                                            path="/category/:fullBookshelfKey*"
                                            render={({ match }) => (
                                                <CategoryPageForBookshelf
                                                    fullBookshelfKey={
                                                        match.params
                                                            .fullBookshelfKey
                                                    }
                                                />
                                            )}
                                        />
                                        <Route
                                            path="/feature/:featureKey"
                                            render={({ match }) => (
                                                <FeaturePage
                                                    featureKey={
                                                        match.params.featureKey
                                                    }
                                                />
                                            )}
                                        />
                                        <Route path="/covid19">
                                            <Covid19Page />
                                        </Route>
                                        <Route
                                            path="/more/:collection/:filter*"
                                            render={({ match }) => {
                                                const collectionNames = (match
                                                    .params
                                                    .collection as string).split(
                                                    "|"
                                                );
                                                const collectionName =
                                                    collectionNames[
                                                        collectionNames.length -
                                                            1
                                                    ];
                                                let collection = collections.get(
                                                    collectionName
                                                );
                                                if (!collection) {
                                                    return (
                                                        <div>
                                                            Unknown collection
                                                        </div>
                                                    );
                                                }
                                                const filters:
                                                    | string
                                                    | undefined =
                                                    match.params.filter;
                                                if (filters) {
                                                    for (const filter of filters.split(
                                                        "/"
                                                    )) {
                                                        const parts = filter.split(
                                                            ":"
                                                        );
                                                        switch (parts[0]) {
                                                            case "level":
                                                                collection = makeCollectionForLevel(
                                                                    collection,
                                                                    parts[1]
                                                                );
                                                                break;
                                                            // ignore any filter we don't recognize
                                                        }
                                                    }
                                                }
                                                return (
                                                    <AllResultsPage
                                                        collection={collection}
                                                    />
                                                );
                                            }}
                                        ></Route>
                                        <Route
                                            path="/:collection/"
                                            render={({ match }) => {
                                                const collectionNames = (match
                                                    .params
                                                    .collection as string).split(
                                                    "|"
                                                );
                                                const collectionName =
                                                    collectionNames[
                                                        collectionNames.length -
                                                            1
                                                    ];
                                                const collection = collections.get(
                                                    collectionName
                                                );
                                                if (!collection) {
                                                    return (
                                                        <div>
                                                            Unknown collection
                                                        </div>
                                                    );
                                                }

                                                switch (collection.pageType) {
                                                    default: // We'll let the ByLevelPage do the best it can
                                                    case "bylevel":
                                                        return (
                                                            <ByLevelPage
                                                                collection={
                                                                    collection!
                                                                }
                                                            />
                                                        );
                                                    case "EnablingWritersPage":
                                                        return (
                                                            <EnablingWritersPage />
                                                        );
                                                }
                                            }}
                                        />
                                        <Route
                                            exact={true}
                                            path={["/", "/read"]}
                                        >
                                            <HomePage />
                                        </Route>
                                    </Switch>
                                </Router>
                            </RouterContext.Provider>
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
                {" "}
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
