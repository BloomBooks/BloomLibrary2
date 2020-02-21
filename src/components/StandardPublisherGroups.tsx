import css from "@emotion/css/macro";
import React from "react";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core"; // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE
/** @jsx jsx */

import { BookGroup } from "./BookGroup";
import { IFilter } from "../IFilter";

export const StandardPublisherGroups: React.FunctionComponent<{
    filter: IFilter;
}> = props => (
    <ul
        css={css`
            padding-left: 20px;
        `}
    >
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
        <BookGroup title="Other books" filter={{ ...props.filter }} />
    </ul>
);
