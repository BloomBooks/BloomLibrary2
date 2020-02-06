import React, { useEffect } from "react";

import { BrowseView } from "./components/BrowseView";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { LoginDialog } from "./components/User/LoginDialog";

import ReactModal from "react-modal";
export const App: React.FunctionComponent<{}> = props => {
    useEffect(() => {
        ReactModal!.defaultStyles!.overlay!.backgroundColor = "rgba(0,0,0,.5)";
    }, []);

    return (
        <React.StrictMode>
            <div className="App">
                <ThemeProvider theme={theme}>
                    <BrowseView />
                </ThemeProvider>
            </div>
            <LoginDialog />
        </React.StrictMode>
    );
};

export default App;
