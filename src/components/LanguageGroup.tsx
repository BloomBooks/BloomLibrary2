import React from "react";
import { css, cx } from "emotion";
import { LanguageCard } from "./LanguageCard";
import { useLibraryQuery } from "./LibraryQueryHooks";
import { getResultsOrMessageElement } from "./LibraryQueryHooks";
import Downshift from "downshift";
import matchSorter from "match-sorter";
import searchIcon from "../search.png";

export const LanguageGroup: React.FunctionComponent = () => {
    const queryResultElements = useLibraryQuery(
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
                            <div
                                className={css`
                                    display: flex;
                                `}
                            >
                                <div className="searchContainer">
                                    <input
                                        className={css`
                                            display: block;
                                            //margin-bottom: 7px;

                                            border: 0;
                                        `}
                                        {...getInputProps()}
                                    />
                                    <img src={searchIcon} />
                                </div>

                                <div>{`${results.length} Languages`}</div>
                            </div>
                            <ul
                                {...getMenuProps()}
                                className={css`
                                    list-style: none;
                                    display: flex;
                                    padding-left: 0;
                                `}
                            >
                                {// enhance: be able to type, e.g., "Bengali" and get the card for বাংলা
                                matchSorter(results, inputValue || "", {
                                    keys: ["name", "isoCode"]
                                }).map((l: any, index: number) => (
                                    <LanguageCard
                                        key={index}
                                        name={l.name}
                                        bookCount={l.usageCount}
                                        languageCode={l.isoCode}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </Downshift>
            </li>
        )
    );
};
