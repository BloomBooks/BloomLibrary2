import { css } from "@emotion/react";
import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { useGetBookCountRaw } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import {
    getResultsOrMessageElement,
    getNoResultsElement,
} from "../connection/GetQueryResultsUI";
import { FormattedMessage } from "react-intl";
import { CollectionInfoWidget } from "./CollectionInfoWidget";
import { ICollection } from "../model/ContentInterfaces";
import { getFilterForCollectionAndChildren } from "../model/Collections";

interface IProps {
    message?: string;
    collection: ICollection;
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
    const filter: IFilter | undefined = props.collection.filter
        ? props.collection.filter
        : getFilterForCollectionAndChildren(props.collection);
    // If filter is undefined (Some collections w/child collections are like this), rather than calculating the number of books in Bloom Library,
    // just don't display any book count.
    // Note though that the home page has filter is empty, and in that case, we want shouldSkipQuery to return false.
    const shouldSkipQuery = filter === undefined;
    const bookCountResult = useGetBookCountRaw(filter || {}, shouldSkipQuery);

    const { noResultsElement, count } = getResultsOrMessageElement(
        bookCountResult
    );
    // note, we don't want the "compact" version of the string here, we want the exact count
    const formattedCount = count === undefined ? "" : count.toLocaleString();

    // Simplified logic: just check if we're loading or have an error
    if (bookCountResult.loading) {
        return getNoResultsElement();
    }

    // If there's an error, show it
    if (noResultsElement) {
        return noResultsElement;
    }

    // OK, we have a real result. If the count is zero
    // and we have a noMatches, use it.
    if (count === 0 && props.noMatches) {
        return props.noMatches;
    }

    // Display the count
    return (
        <span // Don't change this to something like h2.  Book count is used in different contexts
            css={css`
                /* don't put a font size here. Book count is used in different contexts */
                margin: 0 !important;
                margin-top: auto;
            `}
        >
            {props.message ? (
                props.message.replace("{0}", formattedCount)
            ) : (
                <FormattedMessage
                    id="bookCount"
                    defaultMessage="{count} books"
                    values={{ count: formattedCount }}
                />
            )}
            <CollectionInfoWidget collection={props.collection} />
        </span>
    );
};
