// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { LanguageCard } from "./LanguageCard";
import { useGetLanguagesList } from "../connection/LibraryQueryHooks";
import { getResultsOrMessageElement } from "../connection/GetQueryResultsUI";
import Downshift from "downshift";
import matchSorter from "match-sorter";
import searchIcon from "../search.png";

export const LanguageGroup: React.FunctionComponent = () => {
    const languageQueryResults = useGetLanguagesList();

    // note on JS deconstruction syntax here: "{A:B} means "rename A to B"
    const {
        noResultsElement, // we'll get this at least temporarily while waiting
        results: listOfAllLanguages
    } = getResultsOrMessageElement(languageQueryResults);
    return (
        noResultsElement || (
            <li
                css={css`
                    margin-top: 30px;
                `}
            >
                <h1>Find Books By Language</h1>

                {/* Downshift handles telling us when to recompute the list of matching items.
                It also claims to present it all in a WAI-ARIA compliant accessible way (untested).
                We give it a function that returns a react element that contains the
                list of matching cards, and it calls
                that function on every keystroke. */}
                <Downshift
                    itemToString={language => (language ? language.name : "")}
                >
                    {({
                        getInputProps,
                        getItemProps,
                        //getLabelProps,
                        getMenuProps,
                        inputValue: currentInputBoxText
                        //highlightedIndex,
                        //selectedItem
                    }) => (
                        <div>
                            <div
                                css={css`
                                    display: flex;
                                `}
                            >
                                <div className="searchContainer">
                                    <input
                                        css={css`
                                            display: block;
                                            //margin-bottom: 7px;

                                            border: 0;
                                        `}
                                        {...getInputProps()} // presumably this connects keyboard events back to downshift
                                    />
                                    <img src={searchIcon} alt="Search" />
                                </div>

                                <div>{`${listOfAllLanguages.length} Languages`}</div>
                            </div>
                            <ul
                                {...getMenuProps()}
                                css={css`
                                    list-style: none;
                                    display: flex;
                                    padding-left: 0;
                                `}
                            >
                                {/* MatchSorter is an npm module that does smart autocomplete over a list of values. */}
                                {/* Enhance: it can handle some misspellings, but not other obvious ones (e.g. enlish) */}
                                {// enhance: be able to type, e.g., "Bengali" and get the card for বাংলা
                                matchSorter(
                                    listOfAllLanguages,
                                    currentInputBoxText || "",
                                    {
                                        keys: ["name", "isoCode"]
                                    }
                                ).map((l: any, index: number) => (
                                    // TODO: to complete the accessibility, we need to pass the Downshift getLabelProps into LanguageCard
                                    // and apply it to the actual label.
                                    <LanguageCard
                                        {...getItemProps({ item: l })}
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
