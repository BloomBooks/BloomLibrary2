// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useEffect, useState } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { ByLevelGroups, makeCollectionForLevel } from "./ByLevelGroups";
import { BookCardGroup } from "./BookCardGroup";
import {
    makeCollectionForSearch,
    useGetCollection,
} from "../model/Collections";
import { makeCollectionForTopic, ByTopicsGroups } from "./ByTopicsGroups";
import { ICollection } from "../model/ContentInterfaces";
import { getBookSearchParams } from "./CollectionPage";
import { track } from "../Analytics";
import { BookCount } from "./BookCount";
import { useDocumentTitle } from "./Routes";

// Given a collection and a string like level:1/topic:anthropology/search:dogs,
// creates a corresponding collection by adding appropriate filters.
// If filters is empty it will just return the input collection.
// As a somewhat special case, filters may end with skip:n for paging through
// a parent collection.
export function generateCollectionFromFilters(
    collection: ICollection,
    filters: string[]
): { filteredCollection: ICollection; skip: number } {
    let filteredCollection = collection;
    let skip = 0;
    if (filters) {
        for (const filter of filters) {
            const parts = filter.split(":");
            switch (parts[0]) {
                case "level":
                    filteredCollection = makeCollectionForLevel(
                        filteredCollection,
                        parts[1]
                    );
                    break;
                case "topic":
                    filteredCollection = makeCollectionForTopic(
                        filteredCollection,
                        parts[1]
                    );
                    break;
                case "search":
                    filteredCollection = makeCollectionForSearch(
                        collection,
                        decodeURIComponent(parts[1]),
                        filteredCollection
                    );
                    break;
                // case "keyword":
                //     filteredCollection = makeCollectionForKeyword(
                //         collection,
                //         decodeURIComponent(parts[1]),
                //         filteredCollection
                //     );
                //     break;
                case "skip":
                    skip = parseInt(parts[1], 10);
                    break;
            }
        }
    }
    return { filteredCollection, skip };
}

// Used when someone clicks "More" on a row that is itself automatically-generated subset of the collection,
// e.g. "Level 2", or "Agriculture". We then want to show a page that is just all the books that would
// belong to that row. So we
// 1) Don't want to show the whole banner (though we could change our minds about that)
// 2) Don't want to show the child collections (they are not part of the row).
// 3) Need a *new* way to categorize the books, since, in the "Level 2" example, we can't just show them all by level again.
//    That way could just be showing them all as a big grid.
// Finally, note that we are calling this "subset" to distinguish from "child collection"... don't confuse the two ideas.
// There can be multiple levels of subset, as in collection/level:2/topic:animal stories/search:dogs
export const CollectionSubsetPage: React.FunctionComponent<{
    collectionName: string; // may have tilde's, after last tilde is a contentful collection urlKey
    filters: string[]; // may result in automatically-created subcollections. Might be multiple ones slash-delimited
}> = (props) => {
    const { collection, loading } = useGetCollection(props.collectionName);
    useDocumentTitle(props.collectionName);
    if (loading) {
        return null;
    }

    if (!collection) {
        return <p>Page does not exist.</p>;
    }

    const {
        filteredCollection: subcollection,
        skip,
    } = generateCollectionFromFilters(collection, props.filters);

    // The idea here is that by default we break things up by level. If we already did, divide by topic.
    // If we already used both, make a flat list.
    // This ignores any information in the collection itself about how it prefers to be broken up.
    // Possibly, we could use that as a first choice, then apply this heuristic if we're filtering
    // to a single aspect of that categorization already.
    // The other issue is that sometimes there aren't enough results to be worth subdividing more.
    // And it can be confusing if only one of the next-level categories has any content.
    // But at this stage we don't have access to a count of items in the collection, or any way to
    // know whether a particular way of subdividing them will actually break things up.
    let subList = <ByLevelGroups collection={subcollection} />;
    if ((props.collectionName + props.filters).indexOf("level:") >= 0) {
        subList = <ByTopicsGroups collection={subcollection} />;
        // If we had previously gone down a topic trail, then just show them all.
        if ((props.collectionName + props.filters).indexOf("topic:") >= 0) {
            subList = (
                <BookCardGroup
                    title={subcollection.label}
                    collection={subcollection}
                    rows={20}
                    skip={skip}
                />
            );
        }
    }
    const sendAnalytics = (count: number) => {
        // This feels as if it should be in a useEffect since it's doing
        // something side-effect-y. But all the hard work is being done
        // by the BookCount component, which promises to call this function
        // exactly once per filter, however many times we render.
        // I was not able to achieve the same with useEffect.
        const parts = subcollection.urlKey.split("/");
        if (parts.length === 2 && parts[1].startsWith(":search:")) {
            const match = parts[1].substring(":search:".length);
            track("Search", { match, count });
        }
        const { params } = getBookSearchParams(subcollection);
        track("Book Search", params);
    };
    return (
        <React.Fragment>
            <div
                css={css`
                    padding: 20px;
                `}
            >
                <Breadcrumbs />
                <BookCount
                    filter={subcollection.filter}
                    reportCount={sendAnalytics}
                />
            </div>

            {/* <SearchBanner filter={props.filter} /> */}
            <ListOfBookGroups>{subList}</ListOfBookGroups>
        </React.Fragment>
    );
};
