import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { useGetBookCountRaw } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import { getResultsOrMessageElement } from "../connection/GetQueryResultsUI";

// typically displays "[count] books", where count is the number of books that pass
// the query. If message is a string containing {0}, displays that string with the
// argument replaced with the count. If message does not contain that, simply displays
// message. (This last option serves as a fall-back when a higher-level client wants
// to display a customized message.)
export const BookCount: React.FunctionComponent<{
    message?: string;
    filter: IFilter;
    //ClassName?: string;
}> = (props) => {
    return props.message && props.message.indexOf("{0}") < 0 ? (
        <>{props.message}</>
    ) : (
        <BookCountInternal {...props} />
    );
};

const BookCountInternal: React.FunctionComponent<{
    message?: string;
    filter: IFilter;
    //ClassName?: string;
}> = (props) => {
    const bookCountResult = useGetBookCountRaw(props.filter);
    const { noResultsElement, count } = getResultsOrMessageElement(
        bookCountResult
    );
    // while we're waiting, this will be blank (from noResultsElement).
    // if there is an error, we'll see that (from noResultsElement)
    return (
        noResultsElement || (
            <span // Don't change this to something like h2.  Book count is used in different contexts
                css={css`
                    /* don't put a font size here. Book count is used in different contexts */
                    margin: 0 !important;
                    margin-top: auto;
                `}
            >
                {props.message
                    ? props.message.replace("{0}", count)
                    : `${count} Books`}
            </span>
        )
    );
};

/*

 let bookCount: React.ReactNode = React.Fragment;
    if (props.bookCount !== undefined) {
        // if it's an empty string, we assume it's pending real data
        bookCount = <h2>{props.bookCount}</h2>;
    } else if (props.filter) {
        bookCount = (
            <h2
                css={css`
                    font-size: 14pt;
                    margin: 0 !important;
                    margin-top: auto;
                `}
            >
                <BookCount filter={props.filter} />
            </h2>
        );
    }
    */
