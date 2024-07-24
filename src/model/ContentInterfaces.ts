import { IFilter } from "../IFilter";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { IStatisticsQuerySpec } from "../IStatisticsQuerySpec";

// simplified down to a non-contentful-specific form which, assumed localization has already been done
export interface IMedia {
    url: string;
    altText: string;
    credits: string;
}
export interface IBanner {
    title: string;
    hideTitle: boolean;
    logo: IMedia | undefined;
    backgroundImage: IMedia | undefined;
    description: string; // markdown
    backgroundImagePosition: string;
    backgroundColor: string;
    textColor: string;
    css: string;
    buttonRow: any;
}

// The string values here must match what we have Contentful putting out.
// So do not edit them unless you plan to migrate the values on Contentful.
export enum BookOrderingScheme {
    Default = "default",
    NewestCreationsFirst = "newest-first",
    LastUploadedFirst = "last-uploaded-first",
    TitleAlphabetical = "title",
    TitleAlphaIgnoringNumbers = "title-ignore-numbers",
    None = "none", // this is used for queries getting counts instead of actual lists of books
}

// This mostly corresponds to the fields of a Collection from Contentful.
// Some of the raw data we get from there gets processed to make simpler fields here.
export interface ICollection {
    contentfulId?: string; // should be undefined if the collection is created by code instead of contentful
    title: string; //used in the <head>, important for SEO
    metaDescription: string; //used in the <head>, important for SEO
    bannerId: string; // contentful ID of banner object. (fields.banner.id)
    layout: string; // from layout.fields.name; or a default if not set in contentful
    rawLayout: string | undefined; // from layout.fields.name; in at least one scenario, we need to know if `layout` is a default or not
    rows?: number;
    orderingScheme?: BookOrderingScheme;
    urlKey: string; // used in react router urls; can be used to look up in contentful
    urlKeyToUseForLabelL10n?: string; // the urlKey we get from Contentful, if we need to change urlKey (e.g. [Template Phash Collection])
    label: string; // used in subheadings and cards
    // enhance: maybe instead provide a function that would return the react nodes, so we could hide this Contentful-specific type?
    richTextLabel?: any; // NB: here we are leaking the Contentful "Document", which does not have an exported type
    description: string;
    urlForBloomPubBundle: string; // used where someone (i.e. Education for Life) is providing a link to a bloomBundle of all the books in the collection.
    urlForBloomSourceBundle: string; // used for collections of shells where it is common for people to want to translate the whole set
    urlForAlphaTiles: string;
    filter?: IFilter; // contentful does give us undefined if this field is empty
    statisticsQuerySpec?: IStatisticsQuerySpec;
    iconForCardAndDefaultBanner?: IMedia;
    iconCredits?: string;
    iconAltText?: string;
    hideLabelOnCardAndDefaultBanner?: boolean;
    kind?: string;
    childCollections: ICollection[]; // only the top level will have these
    type: "collection" | "page" | "link";
    expandChildCollectionRows: boolean;
    showBookCountInRowDisplay: boolean;
    // When the filter cannot be fully defined as simple json in a Contentful collection (interpreted by ParseServer).
    // E.g., we need to run code like getBestLevelStringOrEmpty() to get at the filter
    secondaryFilter?: (basicBookInfo: IBasicBookInfo) => boolean;
    // Note that duplicateBookFilterName is also a (tertiary?) filter of sorts, but with a specific
    // purpose.
    duplicateBookFilterName?: string;
    // The "context language" helps filters. If we know we're showing French books, then
    // the duplicateBookFilter can use that to remove duplicates that were uploaded
    // primarily for some other language.
    contextLangTag?: string;
    sponsorshipImage?: IMedia;
    country?: string;
}

// A "raw" collection freshly obtained from Contentful before processing into an ICollection
export interface IRawCollection {
    fields: any;
}

export interface IEmbedSettings {
    urlKey: string; // localized will be something like this: { [key: string]: string };
    enabled: boolean;
    collectionUrlKey: string;
    // domain: string; was a good idea but we're not allowed, from an iframe, to know the host domain
}
