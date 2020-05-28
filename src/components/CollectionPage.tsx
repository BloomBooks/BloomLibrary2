import React, { useEffect, useState, useMemo, useContext } from "react";
import { ByLevelPage } from "./PublisherPages";
import { EnablingWritersPage } from "./EnablingWritersPage";
//import { CachedTablesContext } from "../App";
import { useContentful } from "react-contentful";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import {
    ICollection2,
    ISubCollection,
    getCollectionData,
    makeLanguageCollection,
    useCollection,
} from "../model/Collections";
import { RowOfPageCards, RowOfPageCardsForKey } from "./RowOfPageCards";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { LevelGroups } from "./LevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";
import { CachedTablesContext } from "../App";
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { getLanguageBannerSpec } from "./banners/LanguageCustomizations";
import { PublisherBanner } from "./banners/PublisherBanner";
import { CollectionGroup } from "./CollectionGroup";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { ByTopicsGroups } from "./ByTopicsGroups";
import QueryString from "qs";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { TopLevelSearch } from "./TopLevelSearch";
import { HomeBanner } from "./banners/HomeBanner";
import { IFilter, InCirculationOptions } from "../IFilter";
import { ButtonRow } from "./ButtonRow";

// export interface IBanner {
//     name: string;
//     bannerImage: string; // contentful id
//     imageCredits: any; // contentful rich text
//     blurb: any; // contentful rich text
// }

export const CollectionPage: React.FunctionComponent<{
    collectionNames: string;
}> = (props) => {
    const location = useLocation();
    const collectionNames = props.collectionNames.split("~");
    const collectionName = collectionNames[collectionNames.length - 1];
    const { collection, error, generatorTag, loading } = useCollection(
        collectionName
    );
    if (loading) {
        return null;
    }

    if (error) {
        console.error(error);
        return null;
    }

    if (!collection) {
        return <div>Collection not found</div>;
    }

    // This is a bizarre place to have the special case for search on the home page. Here's why:
    // On most pages, a search param just modifies which books are shown (specifically in lists
    // coming from the useSearchBooks function in LibraryQueryHooks.ts). We get all the filters
    // and layout implied by the rest of the route, but results restricted by the search.
    // But we don't want that when someone types a query on the home page, since so few things
    // would be affected that users would not see a useful filtered list. So typing something in
    // that box has to produce something different on the home page.
    // Now, we could make the search box do something special and make a different route, something
    // like /search:dogs instead of /?search=dogs. But as well as needing a new route for /search
    // and a component to implement it and the special case in the search box code, we'd need
    // another special case in useSearchBooks. Having special cases in all those places feels
    // worse than this.
    // It would seem logical to just make the router use a different route based on looking for the
    // ?search param. But as far as I can discover, that simply isn't supported.
    if (collection.urlKey === "root.read" && location.search) {
        const queryParams = QueryString.parse(location.search.substring(1));
        if (queryParams.search) {
            return <TopLevelSearch collection={collection} />;
        }
    }

    const parents = [...collectionNames];
    if (parents[0] === "root.read") {
        parents.splice(0, 1);
    }

    const collectionParents = parents.join("~"); // parents for subcollection includes own key
    parents.pop();

    const bookParents = parents.join("~"); // parents for books collection does not include own key

    const collectionRows = collection.childCollections.map((c) => {
        if (c.urlKey === "language-chooser") {
            return <LanguageGroup key="lang" />;
        }
        return (
            <RowOfPageCardsForKey
                key={c.urlKey}
                urlKey={c.urlKey}
                parents={collectionParents}
            />
        );
    });

    let booksComponent: React.ReactElement | null = null;
    if (collection.filter) {
        switch (collection.layout) {
            default:
                //"by-level": I'd like to have this case here for clarity, but lint chokes
                booksComponent = (
                    <LevelGroups
                        collection={collection}
                        parents={bookParents}
                    />
                );
                break;
            case "no-books": // leave it null
                break;
            case "all-books": // untested
                booksComponent = (
                    <CollectionGroup
                        collection={collection}
                        parents={bookParents}
                        rows={
                            collection.urlKey === "new-arrivals"
                                ? 10
                                : undefined
                        }
                    />
                );
                break;
            case "by-language":
                // enhance: may want to use reportBooksAndLanguages callback so we can insert
                // a string like "X books in Y languages" into our banner. But as yet the
                // ContentfulBanner has no way to do that.
                booksComponent = (
                    <ByLanguageGroups
                        titlePrefix=""
                        filter={collection.filter}
                    />
                );
                break;
            case "by-topic": // untested on this path, though ByTopicsGroup is used in AllResultsPage
                booksComponent = (
                    <ByTopicsGroups
                        collection={collection}
                        parents={bookParents}
                    />
                );

                break;
        }
    }

    let banner = (
        <ContentfulBanner
            id={collection.banner}
            collection={collection}
            filter={collection.filter}
        />
    );
    if (collection.urlKey === "root.read") {
        const almostAllBooksFilter: IFilter = {
            inCirculation: InCirculationOptions.Yes,
        };
        banner = <HomeBanner filter={almostAllBooksFilter} />;
    }

    return (
        <div>
            {banner}
            <ListOfBookGroups>
                {collectionRows}
                {booksComponent}
            </ListOfBookGroups>
        </div>
    );
};
