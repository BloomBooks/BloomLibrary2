// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LevelGroups, makeCollectionForLevel } from "./LevelGroups";
import { CollectionGroup } from "./CollectionGroup";
import {
    ICollection,
    makeCollectionForSearch,
    useCollection,
} from "../model/Collections";
import { makeCollectionForTopic, ByTopicsGroups } from "./ByTopicsGroups";

export function getSubCollectionForFilters(
    collection: ICollection,
    filters: string
): { filteredCollection: ICollection; skip: number } {
    let filteredCollection = collection;
    let skip = 0;
    if (filters) {
        for (const filter of filters.split("/")) {
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
                        parts[1],
                        filteredCollection
                    );
                    break;
                case "skip":
                    skip = parseInt(parts[1], 10);
                    break;
            }
        }
    }
    return { filteredCollection, skip };
}

// I don't know if we'll stick with this... but for now this is what you get
// if there are lots of books and you scroll to the end of the 20 or so that
// we put in a row, and then you click on the MoreCard there to see the rest
export const AllResultsPage: React.FunctionComponent<{
    collectionName: string; // may have tilde's, after last tilde is a contentful collection urlKey
    filters: string; // may result in automatically-created subcollections. Might be multiple ones slash-delimited
}> = (props) => {
    const collectionNames = props.collectionName.split("~");
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
        return <p>Page does not exist.</p>;
    }

    const {
        filteredCollection: subcollection,
        skip,
    } = getSubCollectionForFilters(collection, props.filters);

    // The idea here is that by default we break things up by level. If we already did, divide by topic.
    // If we already used both, make a flat list.
    // This ignores any information in the collection itself about how it prefers to be broken up.
    // Possibly, we could use that as a first choice, then apply this heuristic if we're filtering
    // to a single aspect of that categorization already.
    // The other issue is that sometimes there aren't enough results to be worth subdividing more.
    // And it can be confusing if only one of the next-level categories has any content.
    // But at this stage we don't have access to a count of items in the collection, or any way to
    // know whether a particular way of subdividing them will actually break things up.
    let subList = <LevelGroups collection={subcollection} />;
    if ((props.collectionName + props.filters).indexOf("level:") >= 0) {
        subList = <ByTopicsGroups collection={subcollection} />;
        if ((props.collectionName + props.filters).indexOf("topic:") >= 0) {
            subList = (
                <CollectionGroup
                    title={subcollection.label}
                    collection={subcollection}
                    rows={20}
                    skip={skip}
                />
            );
        }
    }
    return (
        <React.Fragment>
            <div
            // css={css`
            //     background-color: black;
            // `}
            >
                <Breadcrumbs />
            </div>
            {/* <SearchBanner filter={props.filter} /> */}
            <ListOfBookGroups>{subList}</ListOfBookGroups>
        </React.Fragment>
    );
};
