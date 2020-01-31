import React, { Component } from "react";

import { BrowseView } from "./components/BrowseView";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";

class App extends Component {
    render() {
        return (
            <React.StrictMode>
                <div className="App">
                    <ThemeProvider theme={theme}>
                        <BrowseView />
                    </ThemeProvider>
                </div>
            </React.StrictMode>
        );
    }
}

export default App;
