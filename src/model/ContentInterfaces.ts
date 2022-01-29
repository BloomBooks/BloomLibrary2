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

// This mostly corresponds to the fields of a Collection from Contentful.
// Some of the raw data we get from there gets processed to make simpler fields here.
export interface ICollection {
    title: string; //used in the <head>, important for SEO
    metaDescription: string; //used in the <head>, important for SEO
    bannerId: string; // contentful ID of banner object. (fields.banner.id)
    layout: string; // from layout.fields.name; or a default if not set in contentful
    rawLayout: string | undefined; // from layout.fields.name; in at least one scenario, we need to know if `layout` is a default or not
    rows?: number;
    order?: string; // suitable for parse server order: param (e.g., -createdAt)

    urlKey: string; // used in react router urls; can be used to look up in contentful
    label: string; // used in subheadings and cards
    // enhance: maybe instead provide a function that would return the react nodes, so we could hide this Contentful-specific type?
    richTextLabel?: any; // NB: here we are leaking the Contentful "Document", which does not have an exported type
    description: string;
    urlForBloomPubBundle: string; // used where someone (i.e. Education for Life) is providing a link to a bloomBundle of all the books in the collection.
    urlForBloomSourceBundle: string; // used for collections of shells where it is common for people to want to translate the whole set
    filter: IFilter;
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
    sponsorshipImage?: IMedia;
    contentfulFilterWasEmpty?: boolean | undefined;
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
