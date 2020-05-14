import React, { Component } from "react";
import { observer } from "mobx-react";
import { HomeGrownRouter, RouterContext } from "../Router";
import { HomePage } from "./HomePage";
import {
    LanguagePage,
    DefaultOrganizationPage,
    //SearchResultsPage,
    AllResultsPage,
    CategoryPageWithDefaultLayout,
} from "./Pages";
import "typeface-roboto";
import { GuatemalaMOEPage } from "./banners/OrganizationCustomizations";
import { forceCheck as forceCheckLazyLoadComponents } from "react-lazyload";
import { EnablingWritersPage } from "./EnablingWritersPage";
import { WycliffePage } from "./WycliffePage";
import { SILLEADPage } from "./SILLEADPage";
import { FeaturePage } from "./FeaturePage";
import { BiblePage } from "./BiblePage";
import { Covid19Page } from "./Covid19Page";
import { BulkEditPage } from "./BulkEdit/BulkEditPage";
import { GridPage } from "./Grid/GridPage";

/* This is the top level component that can be hosted on a website to view and interact with the bloom library */
@observer
export class BrowseView extends Component {
    private router = new HomeGrownRouter();

    private currentPage() {
        switch (this.router.current?.pageType) {
            // case "Covid19":
            //     return <Covid19Page />;
            case "home":
                return <HomePage />;
            case "book-detail":
                // This will split the code so that you only download/parse all the book detail stuff if you go to
                // the Book Detail page.
                const BookDetail = React.lazy(() =>
                    import(
                        /* webpackChunkName: "bookDetail" */ "./BookDetail/BookDetail"
                    )
                );
                return (
                    <React.Suspense fallback={<div>Loading...</div>}>
                        <BookDetail
                            //id={this.router.current.bookId!}
                            contextLangIso={this.router.current?.contextLangIso}
                        />
                    </React.Suspense>
                );

            // case "book-read":
            //     return <ReadBookPage id={this.router.current.bookId!} />;
            // case "search":
            //     return (
            //         <SearchResultsPage filter={this.router.current.filter} />
            //     );
            case "bulk":
                return <BulkEditPage />;
            case "grid":
                return <GridPage />;

            // case "more":
            //     return (
            //         <AllResultsPage
            //             title={this.router.current.title}
            //             filter={this.router.current.filter}
            //         />
            //     );
            // case "language":
            //     return (
            //         <LanguagePage
            //             title={this.router.current.title}
            //             filter={this.router.current.filter}
            //         />
            //     );
            // case "project":
            //     switch (this.router.current.filter.bookshelf) {
            //         case "Enabling Writers Workshops":
            //             return <EnablingWritersPage />;
            //         case "Bible":
            //             return <BiblePage />;
            //         default:
            //             return (
            //                 <ProjectPageWithDefaultLayout
            //                     title={this.router.current.title}
            //                     filter={this.router.current.filter}
            //                 />
            //             );
            //     }
            // case "publisher":
            // case "org":
            //     switch (this.router.current.filter.bookshelf) {
            //         case "Pratham":
            //             return <PrathamPage />;
            //         case "3Asafeer":
            //             return <AsafeerPage />;
            //         case "African Storybook":
            //             return <AfricanStorybookPage />;
            //         case "Book Dash":
            //             return <BookDashPage />;
            //         case "The Asia Foundation":
            //             return <AsiaFoundationPage />;
            //         case "Room to Read":
            //             return <RoomToReadPage />;
            //         case "Ministerio de Educación de Guatemala":
            //             return <GuatemalaMOEPage />;
            //         case "SIL LEAD":
            //             return <SILLEADPage />;
            //         case "Wycliffe":
            //             return <WycliffePage />;
            //         default:
            //             return (
            //                 <DefaultOrganizationPage
            //                     title={this.router.current.title}
            //                     filter={this.router.current.filter}
            //                 />
            //             );
            //     }
            // case "category":
            //     switch (this.router.current.filter.bookshelf) {
            //         case "Bible":
            //             return <BiblePage />;
            //         default:
            //             switch (this.router.current.filter.topic) {
            //                 // case "Health":
            //                 //     return <Covid19Page />;
            //                 default:
            //                     return (
            //                         <CategoryPageWithDefaultLayout
            //                             title={this.router.current.title}
            //                             filter={this.router.current.filter}
            //                         />
            //                     );
            //             }
            //     }
            // case "feature":
            //     return (
            //         <FeaturePage
            //             title={this.router.current.title}
            //             filter={this.router.current.filter}
            //         />
            //     );

            default:
                return "Unknown page type " + this.router.current?.pageType;
        }
    }

    public render() {
        document.title = `Bloom Library: ${this.router.current?.title}`;
        this.followUpOnLazyLoads();
        return (
            // <RouterContext.Provider value={this.router}>
            //     <Header />
            //     {this.currentPage()}
            // </RouterContext.Provider>
            this.currentPage()
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
