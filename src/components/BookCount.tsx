import React from "react";
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
            <>
                {props.message
                    ? props.message.replace("{0}", count)
                    : `${count} Books`}
            </>
        )
    );
};
