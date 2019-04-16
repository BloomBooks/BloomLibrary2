import React from "react";
import { css, cx } from "emotion";
import { LanguageCard } from "./LanguageCard";
import { useQueryBlorgClass } from "./useQueryBlorg";
import { getResultsOrMessageElement } from "./useQueryBlorg";

interface IProps {
    title: string;
}

export const LanguageGroup: React.FunctionComponent<IProps> = props => {
    const queryResultElements = useQueryBlorgClass(
        "language",
        {
            keys: "name,usageCount,isoCode",
            limit: 10,
            //   where: props.filter || "",
            order: "-usageCount"
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
                        <LanguageCard
                            key={l.isoCode}
                            name={l.name}
                            bookCount={l.usageCount}
                            languageCode={l.isoCode}
                        />
                    ))}
                </ul>
            </li>
        )
    );
};
