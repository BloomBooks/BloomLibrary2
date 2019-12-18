import React from "react";
import {
    useGetBookCount,
    getResultsOrMessageElement
} from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";

export const BookCount: React.FunctionComponent<{
    message?: string;
    filter: IFilter;
    //ClassName?: string;
}> = props => {
    const bookCountResult = useGetBookCount(props.filter);
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
