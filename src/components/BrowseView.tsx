import React, { Component } from "react";
import { observer } from "mobx-react";
import { BlorgRouter, RouterContext } from "../BlorgRouter";
import { HomePage } from "./HomePage";
import CategoryPage from "./CategoryPage";
import { css } from "emotion";

@observer
class BrowseView extends Component {
  private router = new BlorgRouter();

  private currentPage() {
    switch (this.router.current.pageType) {
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
        {this.router.locationStack.map(l => (
          <li key={l.title}>
            <a
              onClick={() => {
                this.router.goToBreadCrumb(l);
              }}
            >
              {l.title}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  render() {
    document.title = `Bloom Library: ${this.router.current.title}`;
    return (
      <RouterContext.Provider value={this.router}>
        {this.breadcrumbs()}
        {this.currentPage()}
      </RouterContext.Provider>
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
