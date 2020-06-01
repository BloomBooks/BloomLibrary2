import { useContext } from "react";
import { IFilter } from "../IFilter";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { getLanguageNamesFromCode, ILanguage } from "./Language";
import { useContentful } from "react-contentful";
import { CachedTablesContext } from "../App";
import { Document } from "@contentful/rich-text-types";

/* From original design: Each collection has
    id
    label
    child collections [ 0  or more ] (potentially ordered?)
    book query (optional)
    pageType (optional)
    banner specification (optional)
    card icon (optional)
    A (potentially ordered) set of books ←- this comes from Parse, not Contentful

    Banner
        ID
        Background Image (optional) We use the “card icon” if this is missing (e.g. all publishers)
        Image Credits
        Blurb
*/

// This mostly corresponds to the fields of a Collection from Contentful.
// Some of the raw data we get from there gets processed to make simpler fields here.
export interface ICollection {
    banner: string; // contentful ID of banner object. (fields.banner.id)
    layout: string; // from layout.fields.name
    order?: string; // suitable for parse server order: param (e.g., -createdAt)

    urlKey: string; // used in react router urls; can be used to look up in contentful
    label: string; // used in subheadings and cards
    richTextLabel?: Document; // rich text
    filter: IFilter;
    iconForCardAndDefaultBanner: string; // url
    iconCredits?: string;
    iconAltText?: string;
    hideLabelOnCardAndDefaultBanner?: boolean;
    childCollections: ICollection[]; // only the top level will have these
    // When the filter cannot be fully defined as simple json in a Contentful collection (interpreted by ParseServer).
    // E.g., we need to run code like getBestLevelStringOrEmpty() to get at the filter
    secondaryFilter?: (basicBookInfo: IBasicBookInfo) => boolean;
}

function convertContentfulFieldsToICollection(fields: any): ICollection {
    // if (!fields || !fields.urlKey) {
    //     return undefined;
    // }
    let order: string | undefined;
    switch (fields.bookSortOrder) {
        case "newest-first":
            order = "-createdAt";
            break;
    }
    let bannerId = fields.banner?.sys?.id;
    if (!bannerId) {
        if (fields.urlKey.startsWith("language:")) {
            bannerId = "7v95c68TL9uJBe4pP5KTN0"; // also in makeLanguageCollection
        } else if (fields.urlKey.startsWith("topic:")) {
            bannerId = "7E1IHa5mYvLLSToJYh5vfW"; // also in makeTopicCollection
        } else {
            bannerId = "Qm03fkNd1PWGX3KGxaZ2v";
        }
    }
    const { credits: iconCredits, altText: iconAltText } = splitMedia(
        fields?.iconForCardAndDefaultBanner
    );
    const result: ICollection = {
        urlKey: fields.urlKey as string,
        label: fields.label,
        richTextLabel: fields.richTextLabel,
        filter: fields.filter,
        iconForCardAndDefaultBanner:
            fields?.iconForCardAndDefaultBanner?.fields?.file?.url,
        iconCredits,
        iconAltText,
        hideLabelOnCardAndDefaultBanner: fields.hideLabelOnCardAndDefaultBanner,
        childCollections: getSubCollections(fields.childCollections),
        banner: bannerId,
        layout: fields.layout?.fields?.name || "by-level",
        order,
    };

    return result;
}

export function splitMedia(media: any): { credits: string; altText: string } {
    if (!media?.fields?.description) {
        return { credits: "", altText: "" };
    }
    const parts = (media.fields.description as string).split("Credits:");
    return { altText: parts[0].trim(), credits: (parts[1] ?? "").trim() };
}

function getSubCollections(childCollections: any[]): ICollection[] {
    if (!childCollections) {
        return [];
    }
    // The final map here is a kludge to convince typescript that filtering out
    // the undefined elements yields a collection without any undefineds.
    return (
        childCollections
            .map((x: any) => convertContentfulFieldsToICollection(x.fields))
            //.filter((y) => y)
            .map((z) => z!)
    );
}

// If we don't find a contentful collection for language:xx, we create one.
export function makeLanguageCollection(
    langCode: string,
    languages: ILanguage[]
): ICollection {
    let languageDisplayName = getLanguageNamesFromCode(langCode!, languages)
        ?.displayNameWithAutonym;
    if (!languageDisplayName) languageDisplayName = langCode;
    return {
        urlKey: "language:" + langCode,
        label: languageDisplayName,
        childCollections: [],
        banner: "7v95c68TL9uJBe4pP5KTN0", // default language banner
        iconForCardAndDefaultBanner: "", // I think this will be unused so can stay blank
        filter: { language: langCode },
        layout: "by-level",
    };
}

export const topics = [
    "Agriculture",
    "Animal Stories",
    "Business",
    "Dictionary",
    "Environment",
    "Primer",
    "Math",
    "Culture",
    "Science",
    "Story Book",
    "Traditional Story",
    "Health",
    "Personal Development",
    "Spiritual",
];

function makeTopicCollection(topicName: string): ICollection {
    return {
        urlKey: "topic:" + topicName,
        label: topicName,
        childCollections: [],
        filter: { topic: topicName },
        banner: "7E1IHa5mYvLLSToJYh5vfW", // standard default for topics
        iconForCardAndDefaultBanner: "none",
        layout: "by-level",
    };
}

export function makeCollectionForSearch(
    search: string,
    baseCollection?: ICollection
): ICollection {
    const filter = { ...baseCollection?.filter, search };
    let label = 'Books matching "' + decodeURIComponent(search) + '"';
    if (baseCollection?.label) {
        label = baseCollection.label + " - " + label;
    }
    let urlKey = "search:" + search;
    if (baseCollection?.urlKey) {
        urlKey = baseCollection.urlKey + "/" + urlKey;
    }
    // Enhance: how can we modify title to indicate that it's restricted to books matching a search,
    // given that it's some unknown contentful representation of a rich text?
    const result: ICollection = {
        ...baseCollection,
        filter,
        label,
        urlKey,
        childCollections: [],
        banner: "Qm03fkNd1PWGX3KGxaZ2v",
        iconForCardAndDefaultBanner: "",
        layout: "by-level",
    };
    return result;
}

export function makeCollectionForPHash(phash: string): ICollection {
    // review: would it be cleaner to make phash a top-level field in filter?
    // Would require changes to the LibraryQueryHooks function for interpreting
    // filter. It's also remotely possible that losing the ability to type
    // a phash: into the search box would be missed.
    const filter = { search: "phash:" + phash };
    const label = "Matching books";
    const urlKey = "phash:" + phash;
    const result: ICollection = {
        filter,
        label,
        urlKey,
        childCollections: [],
        banner: "Qm03fkNd1PWGX3KGxaZ2v", // default
        iconForCardAndDefaultBanner: "",
        layout: "by-level",
    };
    return result;
}

function makeTopicSubcollections(): ICollection[] {
    return topics.map((t) => makeTopicCollection(t));
}

interface IContenfulCollectionQueryResponse {
    collection?: ICollection;
    error?: object; // whatever useContentful gives us if something goes wrong.
    loading: boolean; // Hook response loading || !fetched, that is, we don't actually have a result yet
}

// A hook function for working with collections, generally retrieved from contentful.
// Usually when first called it will return a result with loading true and the collection undefined.
// When the query is complete a state change will cause it to be called again and return a useful
// result.
// In some cases, if a collection is not found on contentful, it is generated by code here.
export function useGetCollectionFromContentful(
    collectionName: string
): IContenfulCollectionQueryResponse {
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    const { data, error, fetched, loading } = useContentful({
        contentType: "collection",
        query: {
            "fields.urlKey": `${collectionName}`,
        },
    });
    if (loading || !fetched) {
        return { collection: undefined, loading: true };
    }

    if (error) {
        console.error(error);
        return { collection: undefined, error, loading: false };
    }

    let collectionIso: string | undefined; // iso code if collection is a generated language collection

    let collection: ICollection;
    //console.log(JSON.stringify(data));

    // If Contentful didn't have a match, we can still generate a collection data structure for certain
    // things, e.g. languages, topics, search, etc.
    if (!data || (data as any).items.length === 0) {
        if (collectionName.startsWith("language:")) {
            // language collections are optionally generated. We can make real cards if we
            // want, to give a more interesting background image etc, but if we don't have
            // one for a language, we generate a default here.
            // We currently don't need to mess with the actual content of the languages
            // collection because a special case in CollectionPage for the language-chooser urlKey
            // creates a special LanguageGroup row, which determines the children directly
            // from the main database.
            collectionIso = collectionName.substring("language:".length);
            collection = makeLanguageCollection(collectionIso, languages);
            return { collection, loading: false };
        } else if (collectionName.startsWith("topic:")) {
            // topic collections currently are generated from the fixed list above.
            // the master "topics" collection is real (so it can be included at the
            // right place in its parent) but its children are inserted by another special case.
            const topicName = collectionName.substring("topic:".length);
            collection = makeTopicCollection(topicName);
            return { collection, loading: false };
        } else if (collectionName.startsWith("search:")) {
            // search collections are generated from a search string the user typed.
            const searchFor = collectionName.substring("search:".length);
            collection = makeCollectionForSearch(searchFor);
            return { collection, loading: false };
        } else if (collectionName.startsWith("phash:")) {
            // search collections are generated from a search string the user typed.
            const phash = collectionName.substring("phash:".length);
            collection = makeCollectionForPHash(phash);
            return { collection, loading: false };
        } else {
            return { loading: false };
        }
    } else {
        // usual case, got collection from contentful
        collection = convertContentfulFieldsToICollection(
            (data as any).items[0].fields
        );
        if (collection.urlKey === "topics") {
            // we currently generate the subcollections for this.
            collection.childCollections = makeTopicSubcollections();
        }
        return { collection, loading: false };
        //console.log(JSON.stringify(collection));
    }
}
