import React from "react";
import { useGetBookCount, getResultsOrMessageElement } from "./useQueryBlorg";
import { IFilter } from "../Router";

export const BookCount: React.FunctionComponent<{
    filter: IFilter;
}> = props => {
    const queryResultElements = useGetBookCount(props.filter);
    const { noResultsElement, count } = getResultsOrMessageElement(
        queryResultElements
    );
    return noResultsElement || <h3>{`${count} Books`}</h3>;
};
