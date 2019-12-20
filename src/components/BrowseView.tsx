import React, { Component } from "react";
import { observer } from "mobx-react";
import { Router, RouterContext } from "../Router";
import { HomePage } from "./HomePage";
import {
    LanguagePage,
    CategoryPage,
    ProjectPage,
    SearchResultsPage,
    AllResultsPage
    // PrathamPage,
    // AfricaStoryBookPage,
    // BookDashPage
} from "./Pages";
import "typeface-roboto";
import { Header } from "./header/Header";
import { BookDetail } from "./BookDetail";

/* This is the top level component that can be hosted on a website to view and interact with the bloom library */
@observer
export class BrowseView extends Component {
    private router = new Router();

    private currentPage() {
        switch (this.router.current.pageType) {
            case "home":
                return <HomePage />;
            case "book-detail":
                return <BookDetail id={this.router.current.bookId!} />;
            case "search":
                return (
                    <SearchResultsPage filter={this.router.current.filter} />
                );
            case "more":
                return (
                    <AllResultsPage
                        title={this.router.current.title}
                        filter={this.router.current.filter}
                    />
                );
            case "language":
                return (
                    <LanguagePage
                        title={this.router.current.title}
                        filter={this.router.current.filter}
                    />
                );
            case "project":
                return (
                    <ProjectPage
                        title={this.router.current.title}
                        filter={this.router.current.filter}
                    />
                );
            case "publisher":
            case "org":
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
                <Header />
                {this.currentPage()}
            </RouterContext.Provider>
        );
    }
}
