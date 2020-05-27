import React from "react";
import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { ICollection2 } from "../model/Collections";
import { CollectionGroup } from "./CollectionGroup";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const LevelGroups: React.FunctionComponent<{
    collection: ICollection2;
    parents?: string;
}> = (props) => {
    return (
        <React.Fragment>
            {["1", "2", "3", "4"].map((level) => (
                <CollectionGroup
                    title={"Level " + level}
                    collection={makeCollectionForLevel(props.collection, level)}
                    parents={props.parents}
                />
            ))}

            {/* Show books that don't have a level */}
            <CollectionGroup
                title="Books for which we are missing levels"
                rows={99}
                collection={makeCollectionForLevel(props.collection, "empty")}
                parents={props.parents}
            />
        </React.Fragment>
    );
};

export function makeCollectionForLevel(
    baseCollection: ICollection2,
    level: string
): ICollection2 {
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
