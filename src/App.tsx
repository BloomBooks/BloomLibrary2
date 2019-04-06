import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import { BrowseView } from "./components/BrowseView";

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowseView />
      </div>
    );
  }
}

export default App;
