import React from "react";
import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { ICollection2 } from "../model/Collections";
import { CollectionGroup } from "./CollectionGroup";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const LevelGroups: React.FunctionComponent<{
    collection: ICollection2;
}> = (props) => {
    return (
        <React.Fragment>
            {["1", "2", "3", "4"].map((level) => (
                <CollectionGroup
                    title={"Level " + level}
                    collection={makeCollectionForLevel(props.collection, level)}
                />
            ))}

            {/* Show books that don't have a level */}
            <CollectionGroup
                title="Books for which we are missing levels"
                rows={99}
                collection={makeCollectionForLevel(props.collection, "empty")}
            />
        </React.Fragment>
    );
};

export function makeCollectionForLevel(
    baseCollection: ICollection2,
    level: string
): ICollection2 {
    const filter = { ...baseCollection.filter, search: "level:" + level };
    let title = baseCollection.title + "- Level " + level;
    const key = baseCollection.urlKey + "/level:" + level;
    if (level === "empty") {
        title = baseCollection.title + "- (missing a level)";
    }
    const result = { ...baseCollection, filter, title, key };
    if (level !== "empty") {
        result.secondaryFilter = (bookInfo) =>
            getBestLevelStringOrEmpty(bookInfo) === level;
    }
    return result;
}
