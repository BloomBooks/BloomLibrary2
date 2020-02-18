import React from "react";
import { BrowseView } from "./components/BrowseView";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";
import {
    useGetTagList,
    useGetCleanedAndOrderedLanguageList
} from "./connection/LibraryQueryHooks";
import { ILanguage } from "./model/Language";
import {
    OSFeaturesContext,
    bloomDesktopAvailable,
    bloomReaderAvailable
} from "./components/OSFeaturesContext";

export const CachedTablesContext = React.createContext<{
    tags: string[];
    languages: ILanguage[];
}>({
    tags: [],
    languages: []
});

export const App: React.FunctionComponent<{}> = props => {
    const tags = useGetTagList();

    const languages = useGetCleanedAndOrderedLanguageList();

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
                    <CachedTablesContext.Provider value={{ tags, languages }}>
                        <OSFeaturesContext.Provider
                            value={{
                                bloomDesktopAvailable,
                                bloomReaderAvailable
                            }}
                        >
                            <BrowseView />
                        </OSFeaturesContext.Provider>
                    </CachedTablesContext.Provider>
                </ThemeProvider>
            </div>
            <LoginDialog />
            {/* </React.StrictMode> */}
        </>
    );
};

export default App;
