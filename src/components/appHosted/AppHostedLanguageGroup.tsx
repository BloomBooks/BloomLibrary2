// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState, useMemo } from "react";
import { LanguageCard } from "../LanguageCard";
import logo from "../../assets/BloomLibrary Logo.svg";
import Downshift, {
    GetItemPropsOptions,
    GetMenuPropsOptions,
    GetRootPropsOptions,
} from "downshift";
import matchSorter from "match-sorter";
import searchIcon from "../../search.png";
import { CachedTablesContext } from "../../model/CacheProvider";
import { getDisplayNamesForLanguage, ILanguage } from "../../model/Language";
import { Redirect } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { propsToHideAccessibilityElement } from "../../Utilities";
import { useResponsiveChoice } from "../../responsiveUtilities";
import { Helmet } from "react-helmet";
import { useCookies } from "react-cookie";
import { appHostedSegment } from "./AppHostedUtils";

// This class is uncomfortably similar to LanguageGroup. It provides the different layout we want
// when displaying a page of language choices (typically on a phone) as opposed to a row of them
// in part of a larger page. Components are differently ordered and grouped and have different
// classes applied. It may be possible to factor out more common code, but it won't be easy.
export const ReaderLanguageGroup: React.FunctionComponent = () => {
    const l10n = useIntl();
    const { languagesByBookCount } = useContext(CachedTablesContext);
    // We want the languages sorted by their primary name. Unfortunately the Language objects
    // don't directly expose that. We need to call a function on each of them to obtain it,
    // then use that to sort them.
    const languages: ILanguage[] = useMemo(() => {
        const languagesWithPrimaryName = languagesByBookCount.map((l) => {
            const names = getDisplayNamesForLanguage(l);
            return { ...l, primary: names.primary };
        });
        return languagesWithPrimaryName.sort(
            (x: { primary: string }, y: { primary: string }) =>
                x.primary.localeCompare(y.primary)
        );
    }, [languagesByBookCount]);
    // setting this to a language code causes a <Redirect> to render and open the page
    // for that code (currently when the user has selected a language by typing and pressing Enter)
    const [langChosen, setLangChosen] = useState("");
    const getResponsiveChoice = useResponsiveChoice();
    const [cookies] = useCookies(["preferredLanguages"]);
    const preferredLangsString: string = cookies["preferredLanguages"];
    const [preferredLangs, preferredLangCodes] = useMemo(() => {
        const preferredCodes = preferredLangsString
            ? preferredLangsString.split(",")
            : [l10n.locale];
        const preferredLangs: ILanguage[] = [];
        // This could be just a filter, but then they are ordered by number of books.
        // We are keeping the codes in order so that the most recently downloaded comes first.
        preferredCodes.forEach((code) => {
            const match = languages.find((lang) => lang.isoCode === code);
            if (match) {
                preferredLangs.push(match);
            }
        });
        return [preferredLangs, preferredCodes];
    }, [preferredLangsString, l10n.locale, languages]);

    let languagesToDisplay: ILanguage[] = [];

    // We'll use Helmet to make this the document's title in its metadata, for use
    // in BloomReader.
    const title = l10n.formatMessage({
        id: "appHosted.chooseLanguage",
        defaultMessage: "Choose a language",
    });

    const getLanguagesMatchingSearchTerm = (
        searchTerm: string | null
    ): ILanguage[] => {
        // MatchSorter is an npm module that does smart autocomplete over a list of values.
        return matchSorter(languages, searchTerm || "", {
            keys: ["englishName", "name", "isoCode"],
        });
    };
    const getRelevantLanguageCardsOrNoMatchMessage = (
        searchTerm: string | null,
        getItemProps: (options: GetItemPropsOptions<any>) => {},
        getMenuProps: (options: GetMenuPropsOptions) => {}
    ) => {
        languagesToDisplay = getLanguagesMatchingSearchTerm(searchTerm).filter(
            (lang) =>
                lang.usageCount && preferredLangCodes.indexOf(lang.isoCode) < 0
        );
        if (languagesToDisplay.length) {
            return (
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-basis: 100px;
                        flex-grow: 100;
                    `}
                    {...getMenuProps({})}
                >
                    <div
                        css={css`
                            display: flex;
                            flex-wrap: wrap;
                            flex-grow: 0;
                            //flex-basis: 100px;
                            align-content: flex-start;
                            //overflow-y: scroll;
                        `}
                    >
                        {preferredLangs.map((l, index) => (
                            <LanguageCard
                                {...getItemProps({ item: l })}
                                key={index}
                                name={l.name}
                                englishName={l.englishName}
                                usageCount={l.usageCount}
                                isoCode={l.isoCode}
                                objectId={l.objectId}
                                targetPrefix={
                                    "/" + appHostedSegment + "/language:"
                                }
                                role="option"
                            />
                        ))}
                    </div>
                    <div
                        css={css`
                            display: flex;
                            flex-wrap: wrap;
                            flex-grow: 100;
                            flex-basis: 100px;
                            align-content: flex-start;
                            overflow-y: scroll;
                        `}
                    >
                        {languagesToDisplay.map((l, index) => (
                            <LanguageCard
                                {...getItemProps({ item: l })}
                                key={index}
                                name={l.name}
                                englishName={l.englishName}
                                usageCount={l.usageCount}
                                isoCode={l.isoCode}
                                objectId={l.objectId}
                                targetPrefix={
                                    "/" + appHostedSegment + "/language:"
                                }
                                role="option"
                            />
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div
                    css={css`
                        padding-top: 10px;
                        font-size: 0.8rem;
                    `}
                >
                    <FormattedMessage
                        id="noLanguageMatch"
                        defaultMessage="We could not find any book with languages matching {searchString}"
                        values={{ searchString: searchTerm }}
                    />
                </div>
            );
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (languagesToDisplay.length) {
                // On an android device, we think the most natural Enter behavior is to close the keyboard.
                // May want to revisit this in the case of a physical keyboard on the device?
                // We currently think it doesn't make sense to close the keyboard if there are no matches.
                //setLangChosen(languagesToDisplay[0].isoCode);
                (window as any).ParentProxy?.postMessage("close_keyboard");
            }
        }
    };
    // This is working around the fact that our typedefs do not know that GetRootPropsOptions
    // is allowed to have a role property. The effect is to prevent the root div that contains
    // the type-ahead box getting the combobox role and related aria declarations that cause
    // NVDA to skip it in browse mode (no, I don't know why it would skip combo boxes!  )
    const rootPropsOptions: GetRootPropsOptions = { refKey: "ref" };
    (rootPropsOptions as any).role = undefined;

    const contentHeight = getResponsiveChoice(140, 170);

    return langChosen ? (
        <Redirect to={"/" + appHostedSegment + "/language:" + langChosen} />
    ) : (
        <li
            role="region"
            aria-labelledby="findBooksByLanguage"
            css={css`
                display: flex;
                flex-direction: column;
                height: 100%;
                margin-left: 15px;
                margin-right: 15px;
            `}
        >
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <img
                css={css`
                    max-width: 300px;
                    margin-top: 15px;
                `}
                src={logo}
                alt={l10n.formatMessage({
                    id: "header.bloomLogo",
                    defaultMessage: "Bloom Logo",
                })}
            />
            <div
                css={css`
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    flex-grow: 0;
                `}
            >
                <h1
                    // This has an ID to match the aria-labelledby above.
                    // The FormattedMessage has an ID to look up the message, but its ID does not
                    // appear in the generated document so there is no confusion.
                    id="findBooksByLanguage"
                >
                    <FormattedMessage
                        id="languageSearch"
                        defaultMessage="Language?"
                    />
                </h1>
                {!!languages.length && ( // !! prevents seeing the zero when languages.length is zero.
                    <div
                        css={css`
                            margin-top: 4px;
                            line-height: 1em;
                        `}
                    >
                        <FormattedMessage
                            id="languagesCount"
                            defaultMessage="{count} Languages"
                            values={{ count: languages.length }}
                        />
                    </div>
                )}
            </div>

            {(languages.length && (
                /* Downshift handles telling us when to recompute the list of matching items.
                It also claims to present it all in a WAI-ARIA compliant accessible way (untested).
                We give it a function that returns a react element that contains the
                list of matching cards, and it calls that function on every keystroke. */
                <Downshift
                    getA11yStatusMessage={({ resultCount }) =>
                        resultCount
                            ? `${resultCount} results. Use tab and shift-tab to navigate`
                            : "No results found"
                    }
                    defaultIsOpen={true}
                >
                    {({
                        getInputProps,
                        getLabelProps,
                        getItemProps,
                        getRootProps,
                        getMenuProps,
                        inputValue: currentInputBoxText,
                    }) => (
                        <div
                            css={css`
                                //height: ${contentHeight}px;
                                flex-grow: 100;
                                flex-basis: 100px; // smallish basis, large grow, it will fill the available space
                                display: flex;
                                flex-direction: column;
                            `}
                        >
                            <div
                                css={css`
                                    display: flex;
                                    margin-bottom: 2px;
                                    height: 32px;
                                    flex-grow: 0;
                                `}
                                {...getRootProps(rootPropsOptions)}
                            >
                                <div
                                    css={css`
                                        display: flex;
                                        border: 1px solid #ccc;
                                        border-radius: 5px;
                                        padding-left: 5px;
                                        height: 26px;
                                        width: 100%;
                                        background-color: white; // the whole thing, not just the input, looks better.
                                    `}
                                >
                                    <div
                                        // downshift insists there must be a label. We don't want to see it, but do want a screen
                                        // reader to find it, so hide it off screen.
                                        css={css`
                                            ${propsToHideAccessibilityElement}
                                        `}
                                        {...getLabelProps()}
                                    >
                                        enter partial language name
                                    </div>
                                    <input
                                        css={css`
                                            display: block;
                                            border: 0;
                                            width: 100%;
                                            // Inputs smaller than 16pt cause Safari on IOS to zoom in (BL-9204), messing up our
                                            // responsive web site by making it wider than the display.
                                            // It would be better if there was a way to say "at least 16px" in case
                                            // some user has extra-large fonts configured, but I don't know a reliable
                                            // way to do it.
                                            font-size: 16px;
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
                            </div>
                            {getRelevantLanguageCardsOrNoMatchMessage(
                                currentInputBoxText,
                                getItemProps,
                                getMenuProps
                            )}
                        </div>
                    )}
                </Downshift>
            )) || (
                // still loading or no response
                <div
                    css={css`
                        height: ${contentHeight}px;
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
