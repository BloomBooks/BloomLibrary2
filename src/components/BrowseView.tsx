import React, { Component } from "react";
import { observer, Observer } from "mobx-react";
import { BrowseContextProvider, BrowseContext } from "./BrowseContext";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";

@observer
class BrowseView extends Component {
  private browseContext = new BrowseContext();

  private currentPage() {
    switch (this.browseContext.currentPageType()) {
      case "home":
        return <HomePage />;
      case "category":
        return <CategoryPage />;
        break;
    }
  }
  private breadcrumbs() {
    return (
      <ul>
        {this.browseContext.locationStack.map(l => (
          <li key={l.label}>{l.label}</li>
        ))}
      </ul>
    );
  }
  render() {
    return (
      <BrowseContextProvider value={this.browseContext}>
        <h1>{this.browseContext.currentPageType()}</h1>
        <h2>{this.breadcrumbs()}</h2>
        {this.currentPage()}
      </BrowseContextProvider>
    );
  }
}

export default BrowseView;
