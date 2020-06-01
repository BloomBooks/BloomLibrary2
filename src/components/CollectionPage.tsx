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
    collectionName: string;
    breadcrumbs: string[]; // ~-separated list indicating how we got to this collection
    filters: string;
    embeddedMode?: boolean;
}> = (props) => {
    const { collection, error, loading } = useCollection(props.collectionName);
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

    // For child collections, the list of breadcrumbs needs to include this one,
    // since each subset is a child collection of this.
    const breadcrumbsForChildren = [...props.breadcrumbs];
    if (props.collectionName !== "root.read") {
        breadcrumbsForChildren.push(props.collectionName);
    }

    const collectionRows = collection.childCollections.map((c) => {
        if (c.urlKey === "language-chooser") {
            return <LanguageGroup key="lang" />;
        }
        return (
            <RowOfPageCardsForKey
                key={c.urlKey}
                urlKey={c.urlKey}
                breadcrumbs={breadcrumbsForChildren}
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
                        breadcrumbs={props.breadcrumbs}
                    />
                );
                break;
            case "no-books": // leave it null
                break;
            case "all-books": // untested
                booksComponent = (
                    <CollectionGroup
                        collection={filteredCollection}
                        breadcrumbs={props.breadcrumbs}
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
                        breadcrumbs={props.breadcrumbs}
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
            {props.embeddedMode || banner}
            <ListOfBookGroups>
                {collectionRows}
                {booksComponent}
            </ListOfBookGroups>
        </div>
    );
};
