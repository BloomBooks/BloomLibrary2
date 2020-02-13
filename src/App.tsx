import React, { useEffect, useRef, useState } from "react";

import { BrowseView } from "./components/BrowseView";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";
import { useGetTagList } from "./connection/LibraryQueryHooks";

export const CachedTablesContext = React.createContext<{ tags: string[] }>({
    tags: []
});

export const App: React.FunctionComponent<{}> = props => {
    // Initialization of the global app context. Other items may be added later.
    // Populate it with a list of the known tags.
    const { response } = useGetTagList();
    const [tags, setTags] = useState<string[]>([]);
    useEffect(() => {
        // When we actually get a response, update our state to contain the tags.
        // (We only expect response to change once, from something like undefined
        // to the actual list of tag objects from the database.)
        // (Note that this means that currently tags will not update if someone
        // either here or elsewhere adds a new tag. It would be fairly easy
        // to insert an addTag function to the context that could be called
        // when a librarian adds a new tag locally.)
        if (response && response.data && response.data.results) {
            const temp: string[] = [];
            for (const tag of response.data.results) {
                temp.push(tag.name);
            }
            setTags(temp);
        }
    }, [response]);

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
                    <CachedTablesContext.Provider value={{ tags }}>
                        <BrowseView />
                    </CachedTablesContext.Provider>
                </ThemeProvider>
            </div>
            <LoginDialog />
            {/* </React.StrictMode> */}
        </>
    );
};

export default App;
