// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";

import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";
import CacheProvider from "./model/CacheProvider";
import { LocalizationContext } from "./localization/LocalizationContext";
import UnderConstruction from "./components/UnderConstruction";
import { BrowserRouter as Router } from "react-router-dom";

import {
    OSFeaturesContext,
    bloomDesktopAvailable,
    bloomReaderAvailable,
    cantUseBloomD,
    mobile,
} from "./components/OSFeaturesContext";
import { RouterContent } from "./model/RouterContent";

export const App: React.FunctionComponent<{}> = (props) => {
    const embeddedMode = window.self !== window.top;

    const showUnderConstruction =
        window.location.hostname !== "bloomlibrary.org" &&
        window.location.hostname !== "embed.bloomlibrary.org" &&
        !window.location.hostname.startsWith("dev") &&
        window.location.hostname !== "localhost";

    return (
        <LocalizationContext>
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
                    <CacheProvider>
                        <OSFeaturesContext.Provider
                            value={{
                                bloomDesktopAvailable,
                                bloomReaderAvailable,
                                cantUseBloomD,
                                mobile,
                            }}
                        >
                            {showUnderConstruction && <UnderConstruction />}
                            <Router>
                                <RouterContent />
                            </Router>
                        </OSFeaturesContext.Provider>
                    </CacheProvider>
                </ThemeProvider>
                {embeddedMode || <LoginDialog />} {/* </React.StrictMode> */}
            </div>
        </LocalizationContext>
    );
};

export default App;
