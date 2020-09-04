// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState } from "react";
import { LanguageCard } from "./LanguageCard";
import Downshift, { GetItemPropsOptions } from "downshift";
import matchSorter from "match-sorter";
import searchIcon from "../search.png";
import { CachedTablesContext } from "../App";
import { ILanguage } from "../model/Language";
import { commonUI } from "../theme";
import { CardSwiper } from "./CardSwiper";
import { Redirect } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

export const LanguageGroup: React.FunctionComponent = () => {
    const l10n = useIntl();
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    // setting this to a language code causes a <Redirect> to render and open the page
    // for that code (currently when the user has selected a language by typing and pressing Enter)
    const [langChosen, setLangChosen] = useState("");

    let filteredLanguages: ILanguage[] = [];

    const getFilteredLanguages = (filter: string | null): ILanguage[] => {
        // MatchSorter is an npm module that does smart autocomplete over a list of values.
        return matchSorter(languages, filter || "", {
            keys: ["englishName", "name", "isoCode"],
        });
    };
    const getFilterLanguagesUI = (
        filter: string | null,
        getItemProps: (options: GetItemPropsOptions<any>) => {}
    ) => {
        filteredLanguages = getFilteredLanguages(filter);
        if (filteredLanguages.length) {
            return (
                <CardSwiper>
                    {filteredLanguages.map((l: any, index: number) => (
                        // TODO: to complete the accessibility, we need to pass the Downshift getLabelProps into LanguageCard
                        // and apply it to the actual label.
                        <LanguageCard
                            {...getItemProps({ item: l })}
                            key={index}
                            name={l.name}
                            englishName={l.englishName}
                            usageCount={l.usageCount}
                            isoCode={l.isoCode}
                            objectId={l.objectId}
                        />
                    ))}
                </CardSwiper>
            );
        } else {
            return (
                <div
                    css={css`
                        height: ${commonUI.languageCardHeightInPx +
                        commonUI.cheapCardMarginBottomInPx -
                        10}px; // 10 matches the padding-top
                        padding-top: 10px;
                        font-size: 0.8rem;
                    `}
                >
                    <FormattedMessage
                        id="noLanguageMatch"
                        defaultMessage="We could not find any book with languages matching {searchString}"
                        values={{ searchString: filter }}
                    />
                </div>
            );
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (filteredLanguages.length) {
                setLangChosen(filteredLanguages[0].isoCode);
            }
        }
    };
    return langChosen ? (
        <Redirect to={"/language:" + langChosen} />
    ) : (
        <li
            css={css`
                margin-top: 30px;
            `}
        >
            <h1>
                <FormattedMessage
                    id="findBooksByLanguage"
                    defaultMessage="Find Books By Language"
                />
            </h1>

            {(languages.length && (
                /* Downshift handles telling us when to recompute the list of matching items.
                It also claims to present it all in a WAI-ARIA compliant accessible way (untested).
                We give it a function that returns a react element that contains the
                list of matching cards, and it calls that function on every keystroke. */
                <Downshift>
                    {({
                        getInputProps,
                        getItemProps,
                        inputValue: currentInputBoxText,
                    }) => (
                        <div>
                            <div
                                css={css`
                                    display: flex;
                                    margin-bottom: 2px;
                                    height: 32px;
                                `}
                            >
                                <div
                                    css={css`
                                        display: flex;
                                        border: 1px solid #ccc;
                                        border-radius: 5px;
                                        padding-left: 5px;
                                        margin-right: 10px;
                                        height: 26px;
                                    `}
                                >
                                    <input
                                        css={css`
                                            display: block;
                                            border: 0;
                                        `}
                                        {...getInputProps({
                                            onKeyPress: (e) =>
                                                handleKeyPress(e),
                                        })}
                                        onBlur={() => {
                                            // Overridden.
                                            // Otherwise, the filtered list of cards reverts
                                            // to unfiltered BEFORE the click event, with the result
                                            // that the wrong card is selected.
                                        }}
                                    />
                                    <img
                                        src={searchIcon}
                                        alt={l10n.formatMessage({
                                            id: "search",
                                            defaultMessage: "Search",
                                        })}
                                    />
                                </div>

                                <div
                                    css={css`
                                        margin-top: 4px;
                                    `}
                                >
                                    <FormattedMessage
                                        id="languagesCount"
                                        defaultMessage="{count} Languages"
                                        values={{ count: languages.length }}
                                    />
                                </div>
                            </div>
                            {getFilterLanguagesUI(
                                currentInputBoxText,
                                getItemProps
                            )}
                        </div>
                    )}
                </Downshift>
            )) || (
                // still loading or no response
                <div
                    css={css`
                        height: 100px;
                    `}
                >
                    <FormattedMessage
                        id="loading"
                        defaultMessage="Loading..."
                    />
                </div>
            )}
        </li>
    );
};
