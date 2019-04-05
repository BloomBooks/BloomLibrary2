import React, { Component } from "react";
import { observer, Observer } from "mobx-react";
import { BrowseContextProvider, BrowseContext } from "./BrowseContext";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
import { css } from "emotion";
@observer
class BrowseView extends Component {
  private browseContext = new BrowseContext();

  private currentPage() {
    switch (this.browseContext.current.pageType) {
      case "home":
        return <HomePage />;
      case "category":
        return <CategoryPage />;
        break;
    }
  }
  private breadcrumbs() {
    return (
      <ul className={breadcrumbsStyle}>
        {this.browseContext.locationStack.map(l => (
          <li key={l.title}>{l.title}</li>
        ))}
      </ul>
    );
  }
  render() {
    document.title = `Bloom Library: ${this.browseContext.current.title}`;
    return (
      <BrowseContextProvider value={this.browseContext}>
        {/* <h1>{this.browseContext.currentPageType()}</h1> */}
        {this.breadcrumbs()}
        {this.currentPage()}
      </BrowseContextProvider>
    );
  }
}
const breadcrumbsStyle = css`
  display: flex;
  padding: 0;
  li {
    margin-right: 3px;
    color: whitesmoke;
    &:after {
      margin-left: 3px;
      margin-right: 3px;
      content: "›";
    }
  }

  li:last-child::after {
    color: transparent;
  }
`;

export default BrowseView;
