import * as React from "react";
import { observable } from "mobx";
import qs from "qs";
import * as mobx from "mobx";
import { IFilter } from "./IFilter";

export interface IFilter {
    language?: string; // review: what is this exactly? BCP 47? Our Parse has duplicate "ethnologueCode" and "isoCode" columns, which actually contain code and full script tags.
    publisher?: string;
    bookshelf?: string;
    feature?: string;
    topic?: string;
    bookShelfCategory?: string;
    otherTags?: string;
    inCirculation?: boolean;
}
export interface ILocation {
    title: string;
    pageType: string;
    filter: IFilter;
}
// This is a super simple router based on a stack of "locations" (page descriptors)
// That stack is a mobx observable, so that the UI can redraw when the top of the stack changes.
export class Router {
    @observable public breadcrumbStack: ILocation[] = new Array<ILocation>();

    public constructor() {
        const home = {
            title: "Home",
            pageType: "home",
            filter: {}
        };
        if (window.location.search == "") {
            // we're just at the root of the site
            this.push(home);
        } else {
            // we've been given a url describing something beyond the home page
            const queryWithoutQuestionMark = window.location.search.substr(
                1,
                99999
            );
            const location = qs.parse(queryWithoutQuestionMark) as ILocation;
            if (location && location.pageType != "home") {
                this.push(home); // so that the breadcrumb starts with Home
            }
            this.push(location);
        }
        window.onpopstate = event => {
            // So, the user did a browser BACK or FORWARD...something. The  current url can tell us what to show, but not how
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
        while (this.current != location) {
            this.breadcrumbStack.pop();
        }
    }

    public push(location: ILocation) {
        // if we go here via a text search and are doing an new one,
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
            "?" + qs.stringify(location)
        );
    }
}

export const RouterContext = React.createContext<Router | null>(null);
