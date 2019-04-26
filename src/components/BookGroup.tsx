import React, { Component } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { IFilter } from "../IFilter";
import {
    useQueryBlorgClass,
    getResultsOrMessageElement
} from "./useQueryBlorg";

interface IProps {
    title: string;
    filter: IFilter; // becomes the "where" clause the query
    order?: string;
}

export const BookGroup: React.FunctionComponent<IProps> = props => {
    const queryResultElements = useQueryBlorgClass(
        "books",
        {
            include: "langPointers",
            keys: "title,baseUrl",
            limit: 10,
            order: props.order || "title"
        },
        props.filter
    );

    const { noResultsElement, results } = getResultsOrMessageElement(
        queryResultElements
    );
    const zeroBooksMatchedElement =
        results && results.length > 0 ? null : (
            <p>{`No Books for "${
                props.title
            }". Should not see this in production`}</p>
        );
    return (
        noResultsElement ||
        zeroBooksMatchedElement || (
            <li
                className={css`
                    margin-top: 30px;
                `}
            >
                <h1>{props.title}</h1>
                <ul
                    className={css`
                        list-style: none;
                        display: flex;
                        padding-left: 0;
                    `}
                >
                    {results.map((b: any) => (
                        <BookCard
                            key={b.baseUrl}
                            title={b.title}
                            baseUrl={b.baseUrl}
                        />
                    ))}
                </ul>
            </li>
        )
    );
};
