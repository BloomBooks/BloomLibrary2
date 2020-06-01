import React from "react";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { ICollection } from "../model/Collections";
import { BookCardGroup } from "./BookCardGroup";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const ByLevelGroups: React.FunctionComponent<{
    collection: ICollection;
    breadcrumbs: string[];
}> = (props) => {
    return (
        <React.Fragment>
            {["1", "2", "3", "4"].map((level) => (
                <BookCardGroup
                    key={level}
                    title={"Level " + level}
                    collection={makeCollectionForLevel(props.collection, level)}
                    breadcrumbs={props.breadcrumbs}
                />
            ))}

            {/* Show books that don't have a level */}
            <BookCardGroup
                key="empty"
                title="Books for which we are missing levels"
                rows={99}
                collection={makeCollectionForLevel(props.collection, "empty")}
                breadcrumbs={props.breadcrumbs}
            />
        </React.Fragment>
    );
};

export function makeCollectionForLevel(
    baseCollection: ICollection,
    level: string
): ICollection {
    let search = "level:" + level;
    if (baseCollection.filter?.search) {
        search += " " + baseCollection.filter.search;
    }
    const filter = { ...baseCollection.filter, search };
    let label = baseCollection.label + " - Level " + level;
    const urlKey = baseCollection.urlKey + "/level:" + level;
    if (level === "empty") {
        label = baseCollection.label + "- (missing a level)";
    }
    // Enhance: how can we append -Level:1 to title, given that it's some unknown
    // contentful representation of a rich text?
    const result = {
        ...baseCollection,
        filter,
        label,
        title: label,
        urlKey,
        layout: "by-topic",
    };
    if (level !== "empty") {
        result.secondaryFilter = (bookInfo) =>
            getBestLevelStringOrEmpty(bookInfo) === level;
    }
    return result;
}
