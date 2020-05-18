import React, { ReactElement, useContext } from "react";
import { IFilter } from "../IFilter";
import {
    IBasicBookInfo,
    getBestLevelStringOrEmpty,
    IBookshelfResult,
} from "../connection/LibraryQueryHooks";
import { ExternalLink } from "../components/banners/ExternalLink";
import { getLanguageNamesFromCode, ILanguage } from "./Language";
import { useContentful } from "react-contentful";
import { CachedTablesContext } from "../App";

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

// This is supposed to correspond to the (data as any).fields that we will actually get
// back from a contenful query on "collection", with a few tweaks
export interface ICollection2 {
    urlKey: string;
    label: string;
    title: any; // rich text, use how??
    childCollections: ISubCollection[]; //
    banner: string; // contentful ID of banner object. (fields.banner.id)
    icon: string; // url
    filter: IFilter;
    layout: string; // from layout.fields.name
    secondaryFilter?: (basicBookInfo: IBasicBookInfo) => boolean;
}

export interface ISubCollection {
    urlKey: string; // used in react router urls; can be used to look up in contentful
    label: string; // used in subheadings and cards
    filter: IFilter;
    icon: string; // url
    childCollections: ISubCollection[]; // only the top level will have these
}

export function getCollectionData(fields: any): ICollection2 {
    const result: ICollection2 = {
        urlKey: fields.key as string,
        label: fields.label,
        title: fields.title,
        filter: fields.filter,
        childCollections: getSubCollections(fields.childCollections),
        banner: fields.banner?.sys?.id,
        icon: fields?.icon?.fields?.file?.url,
        layout: fields.layout?.fields?.name || "by-level",
    };
    return result;
}

function getSubCollections(childCollections: any[]): ISubCollection[] {
    if (!childCollections) {
        return [];
    }
    // The final map here is a kludge to convince typescript that filtering out
    // the undefined elements yields a collections without any undefineds.
    return childCollections
        .map((x: any) => getSubCollectionData(x.fields))
        .filter((y) => y)
        .map((z) => z!);
}

function getSubCollectionData(fields: any): ISubCollection | undefined {
    if (!fields || !fields.key) {
        return undefined;
    }
    const result: ISubCollection = {
        urlKey: fields.key as string,
        label: fields.label,
        filter: fields.filter,
        icon: fields?.icon?.fields?.file?.url,
        childCollections: getSubCollections(fields.childCollections),
    };
    return result;
}

export function makeLanguageCollection(
    langCode: string,
    languages: ILanguage[]
): ICollection2 {
    let languageDisplayName = getLanguageNamesFromCode(langCode!, languages)
        ?.displayNameWithAutonym;
    if (!languageDisplayName) languageDisplayName = langCode;
    return {
        urlKey: "language:" + langCode,
        label: languageDisplayName,
        title: languageDisplayName,
        childCollections: [],
        banner: "", // some default?
        icon: "", // I think this will be unused so can stay blank
        filter: { language: langCode },
        layout: "by-level",
    };
}

export interface useCollectionResponse {
    collection?: ICollection2;
    generatorTag?: string; // gets a value for generated collections, like isoCode for languages.
    error?: object; // whatever useContentful gives us if something goes wrong.
    loading: boolean; // Hook response loading || !fetched, that is, we don't actually have a result yet
}

export function useCollection(collectionName: string): useCollectionResponse {
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    const { data, error, fetched, loading } = useContentful({
        contentType: "collection",
        query: {
            "fields.key": `${collectionName}`,
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

    let collection: ICollection2;
    //console.log(JSON.stringify(data));
    if (!data || (data as any).items.length === 0) {
        if (collectionName.startsWith("language:")) {
            collectionIso = collectionName.substring("language:".length);
            collection = makeLanguageCollection(collectionIso, languages);
            return { collection, generatorTag: collectionIso, loading: false };
        } else {
            return { loading: false };
        }
    } else {
        // usual case, got collection from contentful
        //const collection = collections.get(collectionName);
        collection = getCollectionData((data as any).items[0].fields);
        return { collection, loading: false };
        //console.log(JSON.stringify(collection));
    }
}
export interface ICollection {
    key?: string; // used to look it up in router code in app; defaults to title
    preTitle?: string;
    title: string;
    hideTitle?: boolean;
    filter: IFilter;
    secondaryFilter?: (basicBookInfo: IBasicBookInfo) => boolean;
    pageType: string;
    homePage?: string;
    homePageText?: string; // defaults to title if needed
    logoUrl?: string;
    // descriptionLinks?: ILink[];
    // description: string[]; // one per paragraph
    blurbHardCoded?: ReactElement;
    //blurbContentfulJson: object;
    order?: string;
    children?: string[];
    // todo:
    // bannerUrl
}

export interface ILink {
    url: string;
    text: string;
}

export function getCollections(bookshelves: IBookshelfResult[]) {
    const collections = new Map<string, ICollection>();
    for (const bookshelf of bookshelves) {
        const parts = bookshelf.key.split("/");
        const key = parts[parts.length - 1];
        let title = key;
        let preTitle = "";
        const countrySplits = title.split("_");
        if (countrySplits.length !== 1) {
            title = countrySplits[1];
            preTitle = countrySplits[0];
        }
        const shelfCollection: ICollection = {
            key,
            title,
            preTitle,
            filter: { bookshelf: bookshelf.key },
            pageType: "bylevel",
        };
        collections.set(key, shelfCollection);
    }

    // currently only used for 'more'
    collections.set("all", {
        title: "All books",
        filter: {},
        pageType: "unknown",
    });

    // Note that some of these will replace the automatically created ones.

    collections.set("African Storybook", {
        title: "African Storybook",
        hideTitle: true,
        filter: { bookshelf: "African Storybook" },
        pageType: "bylevel",
        homePage: "https://www.africanstorybook.org/",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/African Storybook.png",
        blurbHardCoded: (
            <React.Fragment>
                <ExternalLink href="https://www.africanstorybook.org/">
                    African Storybook
                </ExternalLink>
                's generosity allows us to host many of their books. Some of
                these books were translated using Bloom and then uploaded here.
                Others were automatically converted from the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </React.Fragment>
        ),
    });

    collections.set("3Asafeer", {
        title: "3Asafeer",
        hideTitle: true,
        filter: { bookshelf: "3Asafeer" },
        pageType: "bylevel",
        homePage: "https://3Asafeer.com/",
        logoUrl: "https://share.bloomlibrary.org/bookshelf-images/Asafeer.png",
        blurbHardCoded: (
            <React.Fragment>
                <ExternalLink href="https://3Asafeer.com/">
                    3Asafeer
                </ExternalLink>
                's generosity allows us to host many of their books. Some of
                these books were translated using Bloom and then uploaded here.
                Others were automatically converted from the{" "}
                <ExternalLink href="https://www.digitallibrary.io/">
                    Global Digital Library
                </ExternalLink>
                . All of them can be translated into your language using Bloom.
            </React.Fragment>
        ),
    });

    collections.set("Pratham", {
        title: "Pratham - StoryWeaver",
        key: "Pratham",
        filter: { bookshelf: "Pratham" },
        pageType: "bylevel",
        homePage: "https://prathambooks.org",
        homePageText: "Pratham Books",
        blurbHardCoded: (
            <React.Fragment>
                <ExternalLink href="https://prathambooks.org">
                    Pratham Books
                </ExternalLink>{" "}
                is a non-profit publisher of children's books.
                <p>
                    Pratham's generosity allows us to host many of their books.
                    Some of these books were translated using Bloom and then
                    uploaded here. Others were automatically converted from
                    Pratham's{" "}
                    <ExternalLink href="https://storyweaver.org.in/">
                        StoryWeaver
                    </ExternalLink>{" "}
                    platform or the{" "}
                    <ExternalLink href="https://www.digitallibrary.io/">
                        Global Digital Library
                    </ExternalLink>
                    . All of them can be translated into your language using
                    Bloom.
                </p>
            </React.Fragment>
        ),
    });

    collections.set("Book Dash", {
        title: "Book Dash",
        hideTitle: true,
        filter: { bookshelf: "Book Dash" },
        pageType: "bylevel",
        homePage: "https://bookdash.org/",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/Book Dash.png",
        blurbHardCoded: (
            <React.Fragment>
                <ExternalLink href="https://bookdash.org/">
                    Book Dash
                </ExternalLink>{" "}
                gathers creative volunteers to create new, African storybooks in
                just one day that anyone can freely print, translate and
                distribute.
                <p>
                    Book Dash's generosity allows us to host many of their
                    books. Some of these books were translated using Bloom and
                    then uploaded here. Others were automatically converted from
                    the{" "}
                    <ExternalLink href="https://www.digitallibrary.io/">
                        Global Digital Library
                    </ExternalLink>
                    . All of them can be translated into your language using
                    Bloom.
                </p>
            </React.Fragment>
        ),
    });

    collections.set("The Asia Foundation", {
        title: "The Asia Foundation",
        hideTitle: true,
        filter: { bookshelf: "The Asia Foundation" },
        pageType: "bylevel",
        homePage: "https://asiafoundation.org/",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/The Asia Foundation.png",
        blurbHardCoded: (
            <React.Fragment>
                <ExternalLink href="https://asiafoundation.org/">
                    The Asia Foundation
                </ExternalLink>{" "}
                is a nonprofit international development organization committed
                to improving lives across a dynamic and developing Asia.
                <p>
                    The Asia Foundation's generosity allows us to host many of
                    their books. Some of these books were translated using Bloom
                    and then uploaded here. Others were automatically converted
                    from the{" "}
                    <ExternalLink href="https://www.digitallibrary.io/">
                        Global Digital Library
                    </ExternalLink>
                    . All of them can be translated into your language using
                    Bloom.
                </p>
            </React.Fragment>
        ),
    });

    collections.set("Room to Read", {
        title: "Room to Read",
        hideTitle: true,
        filter: { bookshelf: "Room to Read" },
        pageType: "bylevel",
        homePage: "https://www.roomtoread.org/",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/The Asia Foundation.png",
        // First sentence should be <i>
        blurbHardCoded: (
            <React.Fragment>
                <i>
                    Founded in 2000 on the belief that World Change Starts with
                    Educated Children<sup>®</sup>,{" "}
                    <ExternalLink href="https://www.roomtoread.org/">
                        Room to Read
                    </ExternalLink>{" "}
                    is creating a world free from illiteracy and gender
                    inequality. We are achieving this goal by helping children
                    in low-income communities develop literacy skills and a
                    habit of reading, and by supporting girls to build skills to
                    succeed in school and negotiate key life decisions.
                </i>
                <p>
                    Room to Read's generosity allows us to host many of their
                    books. Some of these books were translated using Bloom and
                    then uploaded here. Others were automatically converted from
                    the{" "}
                    <ExternalLink href="https://www.digitallibrary.io/">
                        Global Digital Library
                    </ExternalLink>
                    . All of them can be translated into your language using
                    Bloom.
                </p>
            </React.Fragment>
        ),
    });

    collections.set("SIL LEAD", {
        title: "SIL LEAD",
        hideTitle: true,
        filter: { bookshelf: "SIL LEAD" },
        pageType: "bylevel",
        homePage: "https://www.sil-lead.org/",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/SIL%20LEAD.png",
        blurbHardCoded: (
            <React.Fragment>
                <p>
                    <ExternalLink href="https://www.sil-lead.org/">
                        SIL LEAD
                    </ExternalLink>{" "}
                    is a faith-based nonprofit helping local, community-based
                    organizations use their own languages to improve their
                    quality of life.
                </p>
            </React.Fragment>
        ),
    });

    collections.set("Enabling Writers Workshops", {
        title: "Enabling Writers Workshops",
        hideTitle: true,
        filter: { bookshelf: "Enabling Writers Workshops" },
        pageType: "EnablingWritersPage",
        homePage:
            "https://www.globalreadingnetwork.net/publications-and-research/enabling-writers-workshop-program-guides-and-toolkits",
        homePageText: "The Enabling Writers",
        logoUrl:
            "https://share.bloomlibrary.org/bookshelf-images/Enabling Writers Workshops.png",
        // unused, custom page...just in case we make it smarter or use it for something additional.
        blurbHardCoded: (
            <React.Fragment>
                <p>
                    <ExternalLink href="https://www.globalreadingnetwork.net/publications-and-research/enabling-writers-workshop-program-guides-and-toolkits">
                        The Enabling Writers
                    </ExternalLink>{" "}
                    workshops (2016-2018) were sponsored by All Children
                    Reading. In these workshops, teams of local writers were
                    trained to produce hundreds of decodable and leveled books
                    with content that reflect local children's culture and
                    language.
                </p>
                <p>
                    This initiative is an offshoot of a previous{" "}
                    <ExternalLink href="https://allchildrenreading.org/competition/enabling-writers-prize/">
                        All Children Reading: A Grand Challenge for Development
                    </ExternalLink>{" "}
                    competition (2014-2015) to produce a book authoring software
                    that can be used globally to develop books for use in early
                    grade reading programs. The competition was supported by
                    United States Agency for International Development, World
                    Vision and the Australian government. This competition
                    spurred us to add major new capabilities to Bloom, and we
                    won the competition.
                </p>
            </React.Fragment>
        ),
    });

    // Do this AFTER we replace automatic ones with coded ones.
    for (const bookshelf of bookshelves) {
        const parts = bookshelf.key.split("/");
        if (parts.length < 2) {
            continue;
        }
        const key = parts[parts.length - 1];
        const parentKey = parts[parts.length - 2];
        const parentShelf = collections.get(parentKey);
        if (!parentShelf) {
            continue; // should not happen, but in dev site somehow does.
        }
        if (!parentShelf!.children) {
            parentShelf!.children = [];
        }
        parentShelf!.children.push(key);
    }

    return collections;
}

export function getSecondaryFilterFunction(
    key: string,
    aspectValue?: string
): (basicBookInfo: IBasicBookInfo) => boolean {
    switch (key) {
        case "getBestLevelStringOrEmpty": {
            // A primary query for a particular level has given us books that have both level=level, and computedLevel=level
            // Here we drop those in which there is a level that is different than what we want, still keeping
            // books without a level in which there is still a computedLevel matching what we want.
            const level = aspectValue!.substring("level=".length);
            return (bookInfo) => getBestLevelStringOrEmpty(bookInfo) === level;
        }
        default:
            throw new Error("unexpected secondary filter function key");
    }
}
