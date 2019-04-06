import React, { Component } from "react";
import { observer } from "mobx-react";
import { Router, RouterContext } from "../Router";
import { HomePage } from "./HomePage";
import {
  CategoryPage,
  PrathamPage,
  AfricaStoryBookPage,
  BookDashPage
} from "./CategoryPage";
import { Breadcrumbs } from "./Breadcrumbs";

@observer
export class BrowseView extends Component {
  private router = new Router();

  private currentPage() {
    switch (this.router.current.pageType) {
      case "home":
        return <HomePage />;
      case "category":
        if (this.router.current.filter.publisher) {
          switch (this.router.current.filter.publisher) {
            case "Pratham":
              return <PrathamPage />;
            case "ASP":
              return <AfricaStoryBookPage />;
            case "BookDash":
              return <BookDashPage />;
          }
        } else return <CategoryPage />;
    }
  }

  render() {
    document.title = `Bloom Library: ${this.router.current.title}`;
    return (
      <RouterContext.Provider value={this.router}>
        <Breadcrumbs />
        {this.currentPage()}
      </RouterContext.Provider>
    );
  }
}
