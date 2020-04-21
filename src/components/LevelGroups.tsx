import React from "react";
import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const LevelGroups: React.FunctionComponent<{
    filter: IFilter;
}> = (props) => (
    <React.Fragment>
        {["1", "2", "3", "4"].map((level) => (
            <BookGroup
                title={"Level " + level}
                filter={{ search: `level:${level}`, ...props.filter }}
                secondaryFilter={(basicBookInfo) => {
                    // At this point the query has given us books that have both level=level, and computedLevel=level
                    // Here we drop those in which there is a level that is different than what we want, still keeping
                    // books without a level in which there is still a computedLevel matching what we want.
                    return getBestLevelStringOrEmpty(basicBookInfo) === level;
                }}
            />
        ))}

        {/* Show books that don't have a level */}
        <BookGroup
            title="Books for which we are missing levels"
            rows={99}
            filter={{ search: `level:empty`, ...props.filter }}
        />
    </React.Fragment>
);
