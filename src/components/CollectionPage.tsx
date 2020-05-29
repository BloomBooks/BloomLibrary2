import React, { useEffect, useState, useMemo, useContext } from "react";

//import { CachedTablesContext } from "../App";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import { useCollection } from "../model/Collections";
import { RowOfPageCardsForKey } from "./RowOfPageCards";
import { LevelGroups } from "./LevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";

import { CollectionGroup } from "./CollectionGroup";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { ByTopicsGroups } from "./ByTopicsGroups";
import { useLocation } from "react-router-dom";
import { HomeBanner } from "./banners/HomeBanner";
import { IFilter, InCirculationOptions } from "../IFilter";
import { getSubCollectionForFilters } from "./Pages";

export const CollectionPage: React.FunctionComponent<{
    collectionNames: string;
    filters: string;
}> = (props) => {
    const location = useLocation();
    const collectionNames = props.collectionNames.split("~");
    const collectionName = collectionNames[collectionNames.length - 1];
    const { collection, error, loading } = useCollection(collectionName);
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

    const { filteredCollection } = getSubCollectionForFilters(
        collection,
        props.filters
    );

    // From here on, think carefully about when to use collection and when filteredCollection.
    // For example, we want the original collection's banner, so it still looks like that
    // collection, but with the filteredCollection's filter so we get the right count.
    // We'll stick with the original layout but each option uses the filtered collection
    // of books.
    // Review: do we want the original collection's children? Currently we're not coming up
    // with derived collections so we could show filtered counts for each of them, or modified
    // links that would take us to filtered subcollections. But if we drop them altogether
    // when there's a filter, it may change the appearance of the page more than expected.

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
    if (filteredCollection.filter) {
        switch (collection.layout) {
            default:
                //"by-level": I'd like to have this case here for clarity, but lint chokes
                booksComponent = (
                    <LevelGroups
                        collection={filteredCollection}
                        parents={bookParents}
                    />
                );
                break;
            case "no-books": // leave it null
                break;
            case "all-books": // untested
                booksComponent = (
                    <CollectionGroup
                        collection={filteredCollection}
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
                        filter={filteredCollection.filter}
                    />
                );
                break;
            case "by-topic": // untested on this path, though ByTopicsGroup is used in AllResultsPage
                booksComponent = (
                    <ByTopicsGroups
                        collection={filteredCollection}
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
            filter={filteredCollection.filter}
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
