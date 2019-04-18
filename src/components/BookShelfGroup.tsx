import React from "react";
import { css, cx } from "emotion";
import { LanguageCard } from "./LanguageCard";
import { useQueryBlorgClass } from "./useQueryBlorg";
import { getResultsOrMessageElement } from "./useQueryBlorg";
import CategoryCard from "./CategoryCard";

interface IProps {
    title: string;
}

export const BookshelfGroup: React.FunctionComponent<IProps> = props => {
    const queryResultElements = useQueryBlorgClass(
        "bookshelf",
        {
            keys: "englishName, key",
            limit: 100
        },
        {}
    );

    const { noResultsElement, results } = getResultsOrMessageElement(
        queryResultElements
    );
    return (
        noResultsElement || (
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
                    {results.map((l: any) => (
                        <CategoryCard
                            title={l.englishName}
                            bookCount="??"
                            filter={{ bookshelf: l.key }}
                        />
                    ))}
                </ul>
            </li>
        )
    );
};
