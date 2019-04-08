import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

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
