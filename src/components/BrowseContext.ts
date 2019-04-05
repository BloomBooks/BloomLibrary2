import * as React from "react";
import { observable } from "mobx";
import qs from "qs";
import * as mobx from "mobx";

interface ILocation {
  title: string;
  pageType: string;
  filter: {};
}
export class BrowseContext {
  @observable public locationStack: ILocation[] = new Array<ILocation>();

  public constructor() {
    if (window.location.search == "") {
      // no filter
      this.push({ title: "Home", pageType: "home", filter: "" });
    } else {
      const queryWithoutQuestionMark = window.location.search.substr(1, 99999);
      this.push(qs.parse(queryWithoutQuestionMark));
    }
    window.onpopstate = event => {
      // So, the user did a browser BACK or FORWARD...something. The  current url can tell us what to show, but not how
      // to show our breadcrumbs. We solve this by supplying the browser's History API with our location stack every time we go deeper.
      // So now, we can just retrieve that stack from this event and make it our new location stack.
      // Since locationStack is a mobx observed object, don't just replace it, operate on it
      this.locationStack.splice(0, this.locationStack.length, ...event.state);
    };
  }

  public get current() {
    return this.locationStack[this.locationStack.length - 1];
  }

  public push(location: ILocation) {
    this.locationStack.push(location);
    window.history.pushState(
      mobx.toJS(this.locationStack),
      this.current.title,
      "?" + qs.stringify(location)
    );
  }
}

const context = React.createContext<BrowseContext | null>(null);
export const BrowseContextProvider = context.Provider;
export const BrowseContextConsumer = context.Consumer;
