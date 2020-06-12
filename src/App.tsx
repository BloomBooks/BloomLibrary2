// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

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
    mobile,
} from "./components/OSFeaturesContext";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Header } from "./components/header/Header";
import { ContentfulContext } from "./ContentfulContext";
import { Routes } from "./components/Routes";
import { Footer } from "./components/Footer";

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

    const embeddedMode = window.self !== window.top;

    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                margin-left: 0;
                height: 100%;
            `}
        >
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
                            mobile,
                        }}
                    >
                        {window.location.hostname === "localhost" || (
                            <UnderConstruction />
                        )}
                        <ContentfulContext>
                            <Router>
                                {embeddedMode || <Header />}
                                {/* This div takes up all the space available so that the footer
                                is either at the bottom or pushed off screen */}
                                <div
                                    id="expandableContent"
                                    css={css`
                                        flex: 1 0 auto;
                                    `}
                                >
                                    <Routes />
                                </div>
                                {embeddedMode || <Footer />}
                            </Router>
                        </ContentfulContext>
                    </OSFeaturesContext.Provider>
                </CachedTablesContext.Provider>
            </ThemeProvider>
            <LoginDialog /> {/* </React.StrictMode> */}
        </div>
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
