import React, { Component } from "react";
import { observer } from "mobx-react";
import { Router, RouterContext } from "../Router";
import { HomePage } from "./HomePage";
import {
    LanguagePage,
    CategoryPage
    // PrathamPage,
    // AfricaStoryBookPage,
    // BookDashPage
} from "./Pages";
import { Breadcrumbs } from "./Breadcrumbs";
import "typeface-roboto";

/* This is the top level component that can be hosted on a website to view and interact with the bloom library */
@observer
export class BrowseView extends Component {
    private router = new Router();

    private currentPage() {
        switch (this.router.current.pageType) {
            case "home":
                return <HomePage />;
            case "language":
                return (
                    <LanguagePage
                        title={this.router.current.title}
                        filter={this.router.current.filter}
                    />
                );
            case "category":
                // if (this.router.current.filter.publisher) {
                //     switch (this.router.current.filter.publisher) {
                //         // case "Pratham":
                //         //     return <PrathamPage />;
                //         // case "ASP":
                //         //     return <AfricaStoryBookPage />;
                //         // case "BookDash":
                //         //     return <BookDashPage />;
                //     }
                // } else
                return (
                    <CategoryPage
                        title={this.router.current.title}
                        filter={this.router.current.filter}
                    />
                );
            default:
                return "Unknown page type " + this.router.current.pageType;
        }
    }

    render() {
        document.title = `Bloom Library: ${this.router.current.title}`;
        return (
            <RouterContext.Provider value={this.router}>
                {this.currentPage()}
            </RouterContext.Provider>
        );
    }
}
