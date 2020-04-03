import React from "react";
import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";

export const StandardPublisherGroups: React.FunctionComponent<{
    filter: IFilter;
}> = props => (
    <React.Fragment>
        <BookGroup
            title="Level 1"
            filter={{ otherTags: "level:1", ...props.filter }}
        />
        <BookGroup
            title="Level 2"
            filter={{ otherTags: "level:2", ...props.filter }}
        />
        <BookGroup
            title="Level 3"
            filter={{ otherTags: "level:3", ...props.filter }}
        />
        <BookGroup
            title="Level 4"
            filter={{ otherTags: "level:4", ...props.filter }}
        />
        {/* Enhance: how do we get all books that don't have a level? */}
        <BookGroup title="All books" rows={99} filter={{ ...props.filter }} />
    </React.Fragment>
);
