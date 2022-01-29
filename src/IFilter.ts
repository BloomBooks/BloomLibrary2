export enum BooleanOptions {
    All,
    No,
    Yes,
}
export interface IFilter {
    language?: string; // review: what is this exactly? BCP 47? Our Parse has duplicate "ethnologueCode" and "isoCode" columns, which actually contain code and full script tags.
    publisher?: string;
    originalPublisher?: string;
    originalCredits?: string;
    bookshelf?: string;
    feature?: string;
    topic?: string;
    bookShelfCategory?: string;
    otherTags?: string;
    // inCirculation:undefined will be treated as InCirculationOptions.Yes
    inCirculation?: BooleanOptions;
    // false or undefined means draft books will not be returned.
    draft?: BooleanOptions;
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
    edition?: string;

    // Each field above generally specifies some limitation on results returned by a Parse query.  The filter
    // defined by the combination of fields produces a set INTERSECTION of all the individual result sets.
    // (This could also be described as a logical AND operation.)  This is good for restricting the output of
    // the filter as narrowly as desired.  But what if we want a set UNION of results instead?  This field
    // provides a means to define a set of alternatives that are combined together as a set UNION.
    // NB: At the moment, there is no way to specify this on contentful.
    anyOfThese?: IFilter[];

    // In grid, we show all the books. But elsewhere, we default to hiding and not counting books with something in exclusiveCollections
    booksWithExclusiveCollections?: BooleanOptions;
    //In grid and bulk edit we use exclusiveCollections to select just these books that have an exclusiveCollection (which are normally hidden in most context in blorg)
    exclusiveCollections?: string;

    // while not strictly part of the filter, collectionUrlKey ends up being logically used as such by the logic that deals with the exclusiveCollections field of books.
    collectionUrlKey?: string;

    // There was a generation of our code where various things operated differently if the filter was undefined (despite the fact that the signature did not allow that)
    // It could get undefined as the data came in, Typescript couldn't type check it.
    // Nowadays, we don't allow that because we need to put stuff in there even if, in contentful, it was empty.
    // So instead, code should use this to determine if it was empty in Contentful, before we created an empty one, or added things, or whatever.
    contentfulFilterWasEmpty?: boolean;
}
