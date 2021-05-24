import css from "@emotion/css/macro";
import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { useGetBookCountRaw } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import {
    getResultsOrMessageElement,
    getNoResultsElement,
} from "../connection/GetQueryResultsUI";
import { FormattedMessage } from "react-intl";

interface IProps {
    message?: string;
    filter?: IFilter;
    noMatches?: JSX.Element;
    //ClassName?: string;
}

// typically displays "[count] books", where count is the number of books that pass
// the query. If message is a string containing {0}, displays that string with the
// argument replaced with the count. If message does not contain that, simply displays
// message. (This last option serves as a fall-back when a higher-level client wants
// to display a customized message.) If noResults is provided, this will be shown
// when the query returns zero books (instead of one of the other options with count zero).
export const BookCount: React.FunctionComponent<IProps> = (props) => {
    return props.message && props.message.indexOf("{0}") < 0 ? (
        <>{props.message}</>
    ) : (
        <BookCountInternal {...props} />
    );
};

const BookCountInternal: React.FunctionComponent<IProps> = (props) => {
    // If filter is undefined (Some collections w/child collections are like this), rather than calculating the number of books in Bloom Library,
    // just don't display any book count.
    // Note though that the home page has filter is empty, and in that case, we want shouldSkipQuery to return false.
    const shouldSkipQuery = props.filter === undefined;
    const bookCountResult = useGetBookCountRaw(
        props.filter || {},
        shouldSkipQuery
    );
    const { noResultsElement, count } = getResultsOrMessageElement(
        bookCountResult
    );
    const [state, setState] = useState({
        filterString: "", // what we're filtering for
        waitingForLoading: false, // do we need to wait for a return result with loading true before we believe results?
        // have we done any one-time side effects of getting a valid count for this filter?
        // The initial value doesn't matter except possibly if the initial search string is empty,
        // when it might help to prevent a spurious display of noMatches
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
        return getNoResultsElement(); // NOT props.noMatches, we don't know yet whether count is zero.
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
            // and we can fall through to show whatever result we have, since loading is properly true.
        } else {
            // Another spurious result before we even sent the request to the server,
            // or if the filter is empty
            return getNoResultsElement();
        }
    }
    // If we get this far, we've seen bookCountResult.loading true for the current
    // filter. So we can trust bookCountResult: if it says loading, we just
    // continue to return noResultsElement; if not, we should have a good count.
    if (bookCountResult.loading) {
        return noResultsElement;
    }

    // OK, we have a real result for the current filter. If the count is zero
    // and we have a noMatches, use it.
    if (count === 0 && !noResultsElement && props.noMatches) {
        // we got a result of zero, so show the special element for that case
        return props.noMatches;
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
                {props.message ? (
                    props.message.replace("{0}", count)
                ) : (
                    <FormattedMessage
                        id="bookCount"
                        defaultMessage="{count} books"
                        values={{ count }}
                    />
                )}
            </span>
        )
    );
};
