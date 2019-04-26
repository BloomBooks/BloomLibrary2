import React, { Component } from "react";

import { BrowseView } from "./components/BrowseView";

class App extends Component {
    render() {
        return (
            <React.StrictMode>
                <div className="App">
                    <BrowseView />
                </div>
            </React.StrictMode>
        );
    }
}

export default App;
