import * as React from "react";
import { observe, observable } from "mobx";

export interface IBrowseContext {
  locationStack: ILocation[];
  push: (location: ILocation) => void;
}
const context = React.createContext<IBrowseContext | null>(null);

interface ILocation {
  label: string;
  pageType: string;
}
export class BrowseContext implements IBrowseContext {
  constructor() {
    this.push({ label: "home", pageType: "home" });
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
  }
  @observable public locationStack: ILocation[] = new Array<ILocation>();
}
export const BrowseContextProvider = context.Provider;
export const BrowseContextConsumer = context.Consumer;
