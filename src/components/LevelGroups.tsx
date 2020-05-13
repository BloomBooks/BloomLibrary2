import React from "react";
import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { ICollection } from "../model/Collections";
import { CollectionGroup } from "./CollectionGroup";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const LevelGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => (
    <React.Fragment>
        {["1", "2", "3", "4"].map((level) => (
            <CollectionGroup
                title={"Level " + level}
                collection={props.collection}
                aspectName="search"
                aspectValue={`level:${level}`}
            />
        ))}

        {/* Show books that don't have a level */}
        <CollectionGroup
            title="Books for which we are missing levels"
            rows={99}
            collection={props.collection}
            aspectName="search"
            aspectValue="level:empty"
        />
    </React.Fragment>
);
