import * as React from "react";
import { observe, observable } from "mobx";
import * as urlParse from "url-parse";
import * as mobx from "mobx";

export interface IBrowseContext {
  locationStack: ILocation[];
  push: (location: ILocation) => void;
}
const context = React.createContext<IBrowseContext | null>(null);

interface ILocation {
  label: string;
  pageType: string;
  query: string;
}
export class BrowseContext implements IBrowseContext {
  constructor() {
    this.push({ label: "home", pageType: "home", query: "" });
    window.onpopstate = event => {
      // So, the user did a browser BACK or FORWARD...something. The  current url can tell us what to show, but not how
      // to show our breadcrumbs. We solve this by suppoly the historyapi with our location stack every time we go deeper.
      // So now, we can just retrieve that stack from this event and make it our new location stack.
      // Since locationStack is a mobx observed object, don't just replace it, operate on it
      this.locationStack.splice(0, this.locationStack.length, ...event.state);
      //     console.log("After onpopstate: " + JSON.stringify(this.locationStack));
    };
  }
  private head() {
    return this.locationStack[this.locationStack.length - 1];
  }

  currentLabel(): string {
    return this.head().label;
  }
  currentPageType(): string {
    return this.head().pageType;
  }
  public push(location: ILocation) {
    this.locationStack.push(location);

    window.history.pushState(
      mobx.toJS(this.locationStack),
      "",
      "/" + location.pageType + "#" + location.query
    );
  }
  @observable public locationStack: ILocation[] = new Array<ILocation>();
}
export const BrowseContextProvider = context.Provider;
export const BrowseContextConsumer = context.Consumer;
