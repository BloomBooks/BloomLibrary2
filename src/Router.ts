import * as React from "react";
import { observable } from "mobx";
import * as QueryString from "qs";
import * as mobx from "mobx";
import { IFilter } from "./IFilter";

export interface ILocation {
    // this is used only when the location is a book detail
    bookId?: string;

    //these are used for other kinds of pages
    //enhance: change to pageTitle to differentiate from book title
    title: string;
    pageType: string;
    filter: IFilter;
    rows?: number;

    // These apply to logging in with auth0 and may be combined with anything else
    state?: string;
    code?: string;
}
// This is a super simple router based on a stack of "locations" (page descriptors)
// That stack is a mobx observable, so that the UI can redraw when the top of the stack changes.
export class Router {
    @observable public breadcrumbStack: ILocation[] = new Array<ILocation>();
    public static home: ILocation = {
        title: "Home",
        pageType: "home",
        filter: {}
    };
    public waitingOnSaveOrCancel: boolean = false;
    public constructor() {
        const home = Router.home;
        if (window.location.search === "") {
            // we're just at the root of the site
            this.push(home);
        } else {
            // we've been given a url describing something beyond the home page
            const queryWithoutQuestionMark = window.location.search.substr(
                1,
                99999
            );
            const location = QueryString.parse(
                queryWithoutQuestionMark
            ) as ILocation; // Enhance: do something if parsing the URL doesn't give all the info we need.

            if (location && location.state && location.code) {
                // just logged in. That does a redirect to a url with these params
                // I think we lose our state! Reset everything...
                this.push({ ...home, ...location });
            } else {
                // If we start up the site from a page other than home, push home into the bottom of the
                // stack so that you can use the breadcrumbs to go to home.
                if (location && location.pageType !== "home") {
                    this.push(home);
                }
                this.push(location);
            }
        }
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
            if (this.waitingOnSaveOrCancel) {
                console.log("waitingOnSaveOrCancel preventing onbeforeunload");
                event.preventDefault();
                window.history.go(1);
                event.returnValue = true;
            }
        };
        // When we do window.history.go(1) to suppress 'back', this will once again raise
        // popState. We don't want that to trigger yet another go(1).
        // This variable keeps track of whether we're in the state of expecting
        // that extra event.
        let secondPopState = false;
        window.onpopstate = (event: PopStateEvent) => {
            // Unfortunately, going 'back' within an SPA does NOT raise the beforeunload event,
            // nor any other event that will let us display an error and prevent going back.
            // This trick simulates it: it is triggered near the end of going back,
            // so if we should not have gone back we "go forward" to get back to where
            // we started.
            // Review: this will also trigger if the user goes 'forward'. So far, I haven't
            // found a place from where you can go back to the book details page, then do
            // some edits, and then try to go forward. I suspect that in that case the
            // proper recovery is to go(-1). But I don't know how to tell the difference.
            if (this.waitingOnSaveOrCancel) {
                console.log("waitingOnSaveOrCancel preventing onpopstate");
                event.preventDefault();
                if (secondPopState) {
                    secondPopState = false;
                } else {
                    secondPopState = true;
                    window.history.go(1);
                    alert("Please cancel or save your changes");
                }
                return;
            }

            // So, the user did a browser BACK or FORWARD...something. The current url can tell us what to show, but not how
            // to show our breadcrumbs. We solve this by supplying the browser's History API with our location stack every time we go deeper.
            // So now, we can just retrieve that stack from this event and make it our new location stack.
            // Since locationStack is a mobx observed object, don't just replace it, operate on it
            if (event.state) {
                this.breadcrumbStack.splice(
                    0,
                    this.breadcrumbStack.length,
                    ...event.state
                );
            }
        };
    }

    public get current(): ILocation {
        return this.breadcrumbStack[this.breadcrumbStack.length - 1];
    }

    public goToBreadCrumb(location: ILocation): void {
        // We could just literally adopt this location, but then we would lose any preceding breadcrumbs.
        // Instead, we want to pop items off the stack until we get to it.
        while (this.current !== location) {
            this.breadcrumbStack.pop();
        }
    }

    // TODO: make this real
    public pushBook(bookId: string) {
        this.push({
            bookId,
            pageType: "book-detail",
            filter: {},
            title: "BOOKz"
        });
    }
    public pushBookRead(bookId: string) {
        this.push({
            bookId,
            pageType: "book-read",
            filter: {},
            title: "BOOKz"
        });
    }
    public push(location: ILocation) {
        if (this.waitingOnSaveOrCancel) {
            console.log(
                "waitingOnSaveOrCancel preventing push to new location"
            );
            alert("Please cancel or save your changes");
            return;
        }
        // if we go here via a text search and are doing a new one,
        // we want to just replace the previous search term, rather
        // than pushing another search on the breadcrumb stack.
        if (
            location &&
            location.filter &&
            location.filter.search &&
            location.filter.search.length > 0 &&
            this.current &&
            this.current.filter &&
            this.current.filter.search &&
            this.current.filter.search.length > 0
        ) {
            this.breadcrumbStack.pop();
        }
        // This will be noticed by the observing view, causing us to move to this location.
        this.breadcrumbStack.push(location);

        // Enter this location in the browser's history.
        window.history.pushState(
            mobx.toJS(this.breadcrumbStack),
            this.current.title,
            "?" + QueryString.stringify(location)
        );
    }
}

export const RouterContext = React.createContext<Router | null>(null);
