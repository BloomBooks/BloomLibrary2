import * as React from "react";
import { observable } from "mobx";
import * as QueryString from "qs";
// tslint:disable-next-line: no-duplicate-imports
import * as mobx from "mobx";
import { IFilter } from "./IFilter";
import {
    restoreScrollPosition,
    storeScrollPosition,
} from "./RestoreScrollPosition";

export interface ILocation {
    // this is used only when the location is a book detail
    bookId?: string;

    //these are used for other kinds of pages
    //enhance: change to pageTitle to differentiate from book title
    title: string;
    pageType: string;
    filter: IFilter;
    rows?: number;

    // This isn't really part of the location, but it is other information we get from
    // the url, all of which is currently parsed into an ILocation object.
    contextLangIso?: string;

    // Often the card that we click on to go to a page, well it already has information
    // about the page that the page will just have to re-query. For example a card that
    // represents a bookshelf has to already have done the query on the bookshelf table
    // in order to know that such a card should exist. So in the onclick for such a card,
    // we can pass on information on that row so that the page can more quickly start
    // building itself instead of having to wait for a whole redundant query round-trip.
    // not ready for this yet: pageInfoAlreadyInHand?: any;

    // These apply to logging in with auth0 and may be combined with anything else
    // state?: string;
    // code?: string;
}
// This is a super simple router based on a stack of "locations" (page descriptors)
// That stack is a mobx observable, so that the UI can redraw when the top of the stack changes.
export class HomeGrownRouter {
    @observable public breadcrumbStack: ILocation[] = new Array<ILocation>();
    public static home: ILocation = {
        title: "Home",
        pageType: "home",
        filter: {},
    };
    public waitingOnSaveOrCancel: boolean = false;
    public constructor() {
        const home = HomeGrownRouter.home;
        const specialPages = ["grid", "bulk"];
        const specialPage = specialPages.find(
            (s) => "/" + s === window.location.pathname
        );
        /*   this check is broken... I tried fixing it with URLSearchParams but it can't
            parse the query string correctly, so our book url must be encoded wrong
            const search = new URLSearchParams(window.location.search).get("search");

        if (CheckForCovidSearch(search)) {
            this.push({
                title: "",
                pageType: "Covid19",
                filter: {},
            });
        } else
        */
        // if (specialPage) {
        //     this.push(home);
        //     this.push({
        //         title: specialPage,
        //         pageType: specialPage,
        //         filter: {},
        //     });
        // } else if (window.location.search === "") {
        //     // we're just at the root of the site
        //     this.push(home);
        // } else {
        //     // we've been given a url describing something beyond the home page
        //     const queryWithoutQuestionMark = window.location.search.substr(
        //         1,
        //         99999
        //     );
        //     const location = QueryString.parse(
        //         queryWithoutQuestionMark
        //     ) as ILocation; // Enhance: do something if parsing the URL doesn't give all the info we need.

        //     if (location && location.pageType !== "home") {
        //         this.push(home);
        //     }
        //     this.push(location);
        // }
        // window.onbeforeunload = (event: BeforeUnloadEvent) => {
        //     if (this.waitingOnSaveOrCancel) {
        //         console.log("waitingOnSaveOrCancel preventing onbeforeunload");
        //         event.preventDefault();
        //         window.history.go(1);
        //         event.returnValue = true;
        //     }
        // };
        // When we do window.history.go(1) to suppress 'back', this will once again raise
        // popState. We don't want that to trigger yet another go(1).
        // This variable keeps track of whether we're in the state of expecting
        // that extra event.
        let secondPopState = false;
        // window.onpopstate = (event: PopStateEvent) => {
        //     // Unfortunately, going 'back' within an SPA does NOT raise the beforeunload event,
        //     // nor any other event that will let us display an error and prevent going back.
        //     // This trick simulates it: it is triggered near the end of going back,
        //     // so if we should not have gone back we "go forward" to get back to where
        //     // we started.
        //     // Review: this will also trigger if the user goes 'forward'. So far, I haven't
        //     // found a place from where you can go back to the book details page, then do
        //     // some edits, and then try to go forward. I suspect that in that case the
        //     // proper recovery is to go(-1). But I don't know how to tell the difference.
        //     if (this.waitingOnSaveOrCancel) {
        //         console.log("waitingOnSaveOrCancel preventing onpopstate");
        //         event.preventDefault();
        //         if (secondPopState) {
        //             secondPopState = false;
        //         } else {
        //             secondPopState = true;
        //             window.history.go(1);
        //             alert("Please cancel or save your changes");
        //         }
        //         return;
        //     }

        //     // So, the user did a browser BACK or FORWARD...something. The current url can tell us what to show, but not how
        //     // to show our breadcrumbs. We solve this by supplying the browser's History API with our location stack every time we go deeper.
        //     // So now, we can just retrieve that stack from this event and make it our new location stack.
        //     // Since locationStack is a mobx observed object, don't just replace it, operate on it, then the UI will notice and update.
        //     if (event.state) {
        //         this.breadcrumbStack.splice(
        //             0, // starting from beginning
        //             this.breadcrumbStack.length, // remove all of them
        //             ...event.state.breadcrumbs // replace with all the elements from the event
        //         );
        //         restoreScrollPosition(event.state);
        //     }
        // };
    }

    public get current(): ILocation {
        return this.breadcrumbStack[this.breadcrumbStack.length - 1];
    }

    public goToBreadCrumb(location: ILocation): void {
        if (location.pageType === "home") {
            // Treat home as a special case so history will work correctly
            this.goHome();
            return;
        }
        // We could just literally adopt this location, but then we would lose any preceding breadcrumbs.
        // Instead, we want to pop items off the stack until we get to it.
        while (this.current !== location) {
            this.breadcrumbStack.pop();
        }
    }

    public goHome(): void {
        this.breadcrumbStack = new Array<ILocation>();
        this.push(HomeGrownRouter.home);
    }

    public pushBook(bookId: string, contextLangIso?: string) {
        const location: ILocation = {
            bookId,
            pageType: "book-detail",
            filter: {},
            title: "Book Detail",
        };
        if (contextLangIso) {
            location.contextLangIso = contextLangIso;
        }
        this.push(location);
    }
    public pushBookRead(bookId: string, contextLangIso?: string) {
        const location: ILocation = {
            bookId,
            pageType: "book-read",
            filter: {},
            title: "Book Read",
        };
        if (contextLangIso) {
            location.contextLangIso = contextLangIso;
        }
        this.push(location);
    }
    public push(location: ILocation) {
        if (this.waitingOnSaveOrCancel) {
            console.log(
                "waitingOnSaveOrCancel preventing push to new location"
            );
            alert("Please cancel or save your changes");
            return;
        }
        // if we got here via a text search and are doing a new one,
        // we want to just replace the previous search term, rather
        // than pushing another search on the breadcrumb stack.
        if (
            this.current?.filter?.search?.length && // we're currently in a search
            location?.filter?.search // we're trying to do a new search
        ) {
            // replace the top of the breadcrumb stack with this new search
            this.breadcrumbStack.pop();
            this.breadcrumbStack.push(location);
            // replace our place in history with this new search, so that "back" will go back to before we started searching
            window.history.replaceState(
                {
                    breadcrumbs: mobx.toJS(this.breadcrumbStack),
                },
                this.current.title,
                "?" + QueryString.stringify(location)
            );
        }
        // normal change to a new page, not driven by a 2nd generation search
        else {
            // This will be noticed by the observing view, causing us to move to this location.
            this.breadcrumbStack.push(location);
            storeScrollPosition();
            // Enter this new location in the browser's history.
            window.history.pushState(
                {
                    breadcrumbs: mobx.toJS(this.breadcrumbStack),
                },
                this.current.title,
                "?" + QueryString.stringify(location)
            );
        }
    }
}

export const RouterContext = React.createContext<HomeGrownRouter | null>(null);
