import React from "react";
import { css, cx } from "emotion";
import { LanguageCard } from "./LanguageCard";
import { useQueryBlorgClass } from "./useQueryBlorg";
import { getResultsOrMessageElement } from "./useQueryBlorg";
import Downshift from "downshift";
import matchSorter from "match-sorter";

export const LanguageGroup: React.FunctionComponent = () => {
    const queryResultElements = useQueryBlorgClass(
        "language",
        {
            keys: "name,usageCount,isoCode",
            limit: 10000,
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
                <h1>Find Books By Language</h1>
                <Downshift
                    defaultIsOpen={true}
                    onChange={selection =>
                        alert(`You selected ${selection.value}`)
                    }
                    itemToString={item => (item ? item.value : "")}
                >
                    {({
                        getInputProps,
                        //getItemProps,
                        //getLabelProps,
                        getMenuProps,
                        inputValue
                        //highlightedIndex,
                        //selectedItem
                    }) => (
                        <div>
                            <input
                                className={css`
                                    display: block;
                                    margin-bottom: 7px;
                                `}
                                {...getInputProps()}
                            />
                            <ul
                                {...getMenuProps()}
                                className={css`
                                    list-style: none;
                                    display: flex;
                                    padding-left: 0;
                                `}
                            >
                                {// enhance: diacritic removal isn't working. Should be able to type"espanol" and get "Español"
                                // enhance: Could tweak params to allow missing letters.
                                // enchance: be able to type, e.g., "Bengali" and get the card for বাংলা
                                matchSorter(results, inputValue || "").map(
                                    (l: any, index: number) => (
                                        <LanguageCard
                                            key={index}
                                            name={l.name}
                                            bookCount={l.usageCount}
                                            languageCode={l.isoCode}
                                        />
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </Downshift>
            </li>
        )
    );
};
