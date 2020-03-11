import React, { Component } from "react";
import { observer } from "mobx-react";
import { Router, RouterContext } from "../Router";
import { HomePage } from "./HomePage";
import {
    LanguagePage,
    DefaultOrganizationPage,
    ProjectPage,
    SearchResultsPage,
    AllResultsPage
} from "./Pages";
import "typeface-roboto";
import { Header } from "./header/Header";
import { BookDetail } from "./BookDetail/BookDetail";
import { ReadBookPage } from "./ReadBookPage";
import {
    PrathamPage,
    AfricanStorybookPage,
    BookDashPage,
    AsafeerPage
} from "./PublisherPages";
import { GuatemalaMOEPage } from "./banners/OrganizationCustomizations";
import { forceCheck as forceCheckLazyLoadComponents } from "react-lazyload";

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
            case "book-read":
                return <ReadBookPage id={this.router.current.bookId!} />;
            case "search":
                return (
                    <SearchResultsPage filter={this.router.current.filter} />
                );
            case "grid":
                // This will split the code so that you only download/parse all the grid stuff if you go to the Grid page
                // Note that it actually produces to *two* chunks, but I don't know why.
                const GridPage = React.lazy(() =>
                    import(/* webpackChunkName: "gridPage" */ "./Grid/GridPage")
                );
                return (
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <GridPage />
                    </React.Suspense>
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
                switch (this.router.current.filter.bookshelf) {
                    case "Pratham":
                        return <PrathamPage />;
                    case "3Asafeer":
                        return <AsafeerPage />;
                    case "African Storybook":
                        return <AfricanStorybookPage />;
                    case "Book Dash":
                        return <BookDashPage />;
                    case "Ministerio de Educación de Guatemala":
                        return <GuatemalaMOEPage />;
                    default:
                        return (
                            <DefaultOrganizationPage
                                title={this.router.current.title}
                                filter={this.router.current.filter}
                            />
                        );
                }
            default:
                return "Unknown page type " + this.router.current.pageType;
        }
    }

    public render() {
        document.title = `Bloom Library: ${this.router.current.title}`;
        this.followUpOnLazyLoads();
        return (
            <RouterContext.Provider value={this.router}>
                <Header />
                {this.currentPage()}
            </RouterContext.Provider>
        );
    }
    // We make life hard on <Lazy> components by thinking maybe we'll show, for example, a row of Level 1 books at
    // the top of the screen. So the <Lazy> thing may think "well, no room for me then until they scroll". But
    // then it turns out that we don't have any level 1 books, so we don't even have a scroll bar. But too late, the
    // <Lazy> row at the bottom has decided it should not display.
    // Fortunately that same library gives us an out with this forceCheck thing (renamed during the import here for clarity).
    private followUpOnLazyLoads() {
        // if all goes well, after a second we'll know which rows we're going to show.
        window.setTimeout(() => forceCheckLazyLoadComponents(), 1000);
        // But maybe things are really slow, so try again in seconds.
        window.setTimeout(() => forceCheckLazyLoadComponents(), 5000);
        // 20 seconds. Ok at this point we may have lost them, I dunno.
        window.setTimeout(() => forceCheckLazyLoadComponents(), 20000);
    }
}
