export enum InCirculationOptions {
    All,
    No,
    Yes,
}
export interface IFilter {
    language?: string; // review: what is this exactly? BCP 47? Our Parse has duplicate "ethnologueCode" and "isoCode" columns, which actually contain code and full script tags.
    publisher?: string;
    originalPublisher?: string;
    bookshelf?: string;
    feature?: string;
    topic?: string;
    bookShelfCategory?: string;
    otherTags?: string;
    // inCirculation:undefined will be treated as InCirculationOptions.Yes
    inCirculation?: InCirculationOptions;
    search?: string;
    keywordsText?: string;
    brandingProjectName?: string;

    // Derivative collections can be defined one of two ways.
    // 1) derivedFrom - a filter which defines the books you want derivatives of.
    // 2) derivedFromCollectionName - the name of a collection which contains the books you want derivatives of.
    // External definitions (such as Contentful) will prefer the latter as it will keep in sync if the parent collection definition changes.
    // But it is possible to provide the former.
    // Internally, if derivedFromCollectionName is provided, we look up the collection's filter and populate derivedFrom from that.
    // If both are set externally, derivedFromCollectionName will win.
    // See limitations on derivative collections in LibraryQueryHooks.processDerivedFrom().
    derivedFrom?: IFilter;
    derivedFromCollectionName?: string;
}
