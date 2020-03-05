// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
//import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
//import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";

export const BookAnalytics: React.FunctionComponent<{
    book: Book;
}> = props => {
    return (
        // removed because the data is in question
        // (props.book.downloadCount > 0 && (
        //     <div>{`Shellbook downloaded ${props.book.downloadCount} times`}</div>
        // )) ||
        null
    );
};
