// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useEffect } from "react";
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
import { getCollectionAnalyticsInfo } from "../analytics/CollectionAnalyticsInfo";
import { track } from "../analytics/Analytics";
import { BookCount } from "./BookCount";
import { setBloomLibraryTitle } from "./Routes";
import { NoSearchResults } from "./NoSearchResults";
import { IntlShape, useIntl } from "react-intl";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";

// Given a collection and a string like level:1/topic:anthropology/search:dogs,
// creates a corresponding collection by adding appropriate filters.
// If filters is empty it will just return the input collection.
// As a somewhat special case, filters may end with skip:n for paging through
// a parent collection.
export function generateCollectionFromFilters(
    collection: ICollection,
    filters: string[],
    l10n: IntlShape
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
                        parts[1],
                        l10n
                    );
                    break;
                case "topic":
                    const topicKey = parts[1];

                    filteredCollection = makeCollectionForTopic(
                        filteredCollection,
                        topicKey
                    );
                    break;
                case "search":
                    filteredCollection = makeCollectionForSearch(
                        collection,
                        decodeURIComponent(parts[1]),
                        l10n,
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
    const l10n = useIntl();

    const { collection, loading } = useGetCollection(props.collectionName);
    // Can't use here, we want title information based on subcollection.
    //useDocumentTitle(props.collectionName);

    // This will be set equal to subcollection if we are able to compute a subcollection.
    // When the useEffect below runs in cases where we don't have a collection yet,
    // and so can't make a subcollection either, it is undefined.
    let possibleSubCollection: ICollection | undefined;

    // This is tricky. We want to generate various things from the actual subcollection
    // we display. But we can't create that until we get the root collection it's based on.
    // On the other hand, the useEffect (or useTrack, which we'd prefer to use for some things) can't occur
    // after the early return statements that handle NOT having a collection, because of rules of hooks.
    // The solution here is to take advantage of the fact that the useEffect function is
    // not called until the END of the render; thus, it can make use of 'possibleSubCollection'
    // although its value is not set until later in the method.
    // On the early renders, collection and hence possibleSubCollection will be undefined,
    // so it does nothing. The first time (and ONLY the first time, unless something
    // makes a meaningful change to our collection or filters) that we do have a collection,
    // we do the side effects. The stringify calls are to prevent the effect firing just because
    // of new object instances with the same content.
    const whatDeterminesSubCollection =
        JSON.stringify(props.filters) + JSON.stringify(collection);
    useEffect(() => {
        if (possibleSubCollection) {
            const { params } = getCollectionAnalyticsInfo(
                possibleSubCollection
            );
            track("Open Collection", params);
            setBloomLibraryTitle(
                getLocalizedCollectionLabel(possibleSubCollection)
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whatDeterminesSubCollection]);

    if (loading) {
        return null;
    }

    if (!collection) {
        return <p>Page does not exist.</p>;
    }

    const {
        filteredCollection: subcollection,
        skip,
    } = generateCollectionFromFilters(collection, props.filters, l10n);
    possibleSubCollection = subcollection;

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
        let maxRows: number | undefined = subcollection.rows; // can be undefined, in which case it's the default
        // If we had previously gone down a topic trail, then just show them all.
        if ((props.collectionName + props.filters).indexOf("topic:") >= 0) {
            if (!maxRows) {
                maxRows = 1000; // show all of the books (or 5000 of them anyway)
            }
            subList = (
                <BookCardGroup
                    title={getLocalizedCollectionLabel(subcollection)}
                    collection={subcollection}
                    rows={maxRows}
                    skip={skip}
                />
            );
        }
    }

    const parts = subcollection.urlKey.split("/");

    let noMatches: JSX.Element | undefined;
    if (parts.length === 2 && parts[1].startsWith(":search:")) {
        const match = parts[1].substring(":search:".length);
        noMatches = <NoSearchResults match={match} />;
    }
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
                    noMatches={noMatches}
                />
            </div>

            {/* <SearchBanner filter={props.filter} /> */}
            <ListOfBookGroups>{subList}</ListOfBookGroups>
        </React.Fragment>
    );
};
