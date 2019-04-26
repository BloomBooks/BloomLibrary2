import React from "react";
import { useGetBookCount, getResultsOrMessageElement } from "./useQueryBlorg";
import { IFilter } from "../IFilter";

export const BookCount: React.FunctionComponent<{
    message?: string;
    filter: IFilter;
}> = props => {
    const queryResultElements = useGetBookCount(props.filter);
    const { noResultsElement, count } = getResultsOrMessageElement(
        queryResultElements
    );
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
