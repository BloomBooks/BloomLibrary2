import css from "@emotion/css/macro";
import React, { useEffect, useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { useGetBookCountRaw } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import {
    getResultsOrMessageElement,
    getNoResultsElement,
} from "../connection/GetQueryResultsUI";

// typically displays "[count] books", where count is the number of books that pass
// the query. If message is a string containing {0}, displays that string with the
// argument replaced with the count. If message does not contain that, simply displays
// message. (This last option serves as a fall-back when a higher-level client wants
// to display a customized message.)
export const BookCount: React.FunctionComponent<{
    message?: string;
    filter: IFilter;
    // This function is called exactly once for each filter, that is,
    // it won't be called while we are loading the count, or on subsequent
    // calls until the filter changes, just the first time we get
    // a real result for a given filter.
    reportCount?: (x: number) => void;
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
    reportCount?: (x: number) => void;
    //ClassName?: string;
}> = (props) => {
    const bookCountResult = useGetBookCountRaw(props.filter);
    const { noResultsElement, count } = getResultsOrMessageElement(
        bookCountResult
    );
    const [state, setState] = useState({
        filterString: "",
        waitingForLoading: false,
        reportedCount: true,
    });
    const filterString = JSON.stringify(props.filter);

    if (filterString !== state.filterString) {
        // new filter string different from old filter string:
        // - this is the first call with an initial or changed filter.
        // - Typically bookCountResult.loading is (wrongly) false.
        // - It's common for this method to be called at least twice
        // after a filter change and to see loading false and a stale result each time.
        // - We want to ignore results until called with bookCountResult.loading true,
        // and in the meantime return the result we should have gotten since
        // bookCountResult.loading should be true.
        setState({
            filterString,
            waitingForLoading: true,
            reportedCount: false,
        });
        return getNoResultsElement();
    }
    if (state.waitingForLoading) {
        if (bookCountResult.loading) {
            // OK, we started loading the data for the new filter.
            // now we can trust the results
            setState({
                filterString,
                waitingForLoading: false,
                reportedCount: false,
            });
            // and we should have the proper noResultsElement, since loading is properly true.
        } else {
            // Another spurious result before we even sent the request to the server.
            return getNoResultsElement();
        }
    }
    // If we get this far, we've seen bookCountResult.loading true for the current
    // filter. So we can trust bookCountResult: if it says loading, we just
    // continue to return noResultsElement; if not, we should have a good count.
    // If this is the FIRST time we got a good count for this filter, we want
    // to invoke our callback.
    // (If we don't HAVE a reportCount callback, reportedCount will never get
    // set. That's harmless and saves another render.)
    if (!state.reportedCount && !bookCountResult.loading && props.reportCount) {
        setState({
            filterString,
            waitingForLoading: false,
            reportedCount: true,
        });
        props.reportCount(count);
    }

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
