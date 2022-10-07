// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState, useMemo, useEffect } from "react";
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
import { commonUI } from "../../theme";

// This class is uncomfortably similar to LanguageGroup. It provides the different layout we want
// when displaying a page of language choices (typically on a phone) as opposed to a row of them
// in part of a larger page. Components are differently ordered and grouped and have different
// classes applied. It may be possible to factor out more common code, but it won't be easy.
export const AppHostedLanguageGroup: React.FunctionComponent = () => {
    const l10n = useIntl();
    const { languagesByBookCount } = useContext(CachedTablesContext);
    // We want the languages sorted by their primary name. Unfortunately the Language objects
    // don't directly expose that. We need to call a function on each of them to obtain it,
    // then use that to sort them.
    const languages: ILanguage[] = useMemo(() => {
        const languagesWithPrimaryName = languagesByBookCount
            .filter((l) => l.usageCount)
            .map((l) => {
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
    // Note: currently languages are only chosen by clicking a button, which is handled elsewhere.
    // But I think it's worth keeping this mechanism, in case we change our minds.
    const [langChosen /*setLangChosen */] = useState("");
    const getResponsiveChoice = useResponsiveChoice();
    const [cookies] = useCookies(["preferredLanguages"]);
    const preferredLangsString: string = cookies["preferredLanguages"];
    const [showAll, setShowAll] = useState(false);
    const [showPreferredLangs, setShowPreferredLangs] = useState(true);
    const [preferredLangs, preferredLangCodes] = useMemo(() => {
        const preferredCodes = preferredLangsString
            ? preferredLangsString.split(",")
            : [l10n.locale];
        preferredCodes.length = 2; // we only have room for 2 currently, and only want one row
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
    // This implements a crude form of laziness. We'll show up to 20 results immediately.
    // The others, which are typically off-screen on a phone, we show after one second, so they
    // are there ready to be scrolled to.
    // I chose this crude approach because I could not get LazyLoad to work here. Possibly it
    // is something to do with rendering the cards inside Downshift. (FWIW: I experimented with
    // using display:block instead of flex/wrap, and also setting height and scrollContainer
    // on the LazyLoad. Since we have to fetch all the languages anyway to sort them and get
    // names to match, we would not save much by being truly lazy about generating the ones
    // that are off-screen, but it is nice to show the user something quickly.
    useEffect(() => {
        setTimeout(() => {
            setShowAll(true);
        }, 1000);
    }, []);

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
            (lang) => preferredLangCodes.indexOf(lang.isoCode) < 0
        );
        const prefColor = commonUI.colors.bloomRed;
        // if (!showAll && languagesToDisplay.length > 10) {
        //     languagesToDisplay.splice(10);
        // }
        if (languagesToDisplay.length) {
            return (
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-basis: 100px;
                        flex-grow: 100;
                        h3 {
                            color: ${commonUI.colors.minContrastGray};
                            font-weight: normal;
                            margin: 0;
                            margin-block-end: 0.25em;
                        }
                    `}
                    {...getMenuProps({})}
                >
                    {
                        // This section shows a list of languages the user has recently downloaded books from.
                        // We hide it when the user has focused the input for typing a partial language name.
                        // We'd rather not do this, but if we continue to show these cards above the list
                        // of matching languages, typically the on-screen keyboard covers almost the entire
                        // list of search results, and the user cannot see whether he has typed enough to
                        // locate the language he wants.
                        // (Another justification: if the user is searching for another language, he's
                        // presumably not currently interested in the ones that were already at the top
                        // of the list.)
                        // See BL-11575.
                        showPreferredLangs && (
                            <>
                                <h3>
                                    <FormattedMessage
                                        id="favoriteLanguages"
                                        defaultMessage="Favorite languages"
                                    />
                                </h3>
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
                                            css={css`
                                                background-color: ${prefColor};
                                            `}
                                            {...getItemProps({ item: l })}
                                            key={index}
                                            name={l.name}
                                            englishName={l.englishName}
                                            usageCount={l.usageCount}
                                            isoCode={l.isoCode}
                                            objectId={l.objectId}
                                            primaryTextColorOverride="white"
                                            secondaryTextColorOverride="#FFFFFFE5" // E5 = 90%
                                            larger={true}
                                            targetPrefix={
                                                "/" +
                                                appHostedSegment +
                                                "/language:"
                                            }
                                            role="option"
                                        />
                                    ))}
                                </div>
                                {/* This had some pretty specific rules someone figured out, so I kept it just in case */}
                                {/* <Divider
                                css={css`
                                    // puts it in the middle of the gap without taking up extra space.
                                    // (Somewhat weirdly, the gap between the two groups of cards is produced by
                                    // the bottom margin on CheapCard.)
                                    margin-top: -${cardSpacing / 2 - 1}px;
                                    margin-bottom: ${cardSpacing / 2 - 1}px;
                                `}
                            /> */}
                                <h3>
                                    <FormattedMessage
                                        id="moreLanguagesCount"
                                        defaultMessage="{count} more languages"
                                        values={{
                                            count: languagesToDisplay.length,
                                        }}
                                    />
                                </h3>
                            </>
                        )
                    }
                    <div
                        id="app-hosted-lang-group-scroller"
                        css={css`
                            display: flex;
                            flex-wrap: wrap;
                            flex-grow: 100;
                            flex-basis: 100px;
                            align-content: flex-start;
                            overflow-y: scroll;
                        `}
                    >
                        {languagesToDisplay.map((l, index) =>
                            showAll || index < 20 ? (
                                <LanguageCard
                                    {...getItemProps({ item: l })}
                                    key={index}
                                    name={l.name}
                                    englishName={l.englishName}
                                    usageCount={l.usageCount}
                                    isoCode={l.isoCode}
                                    objectId={l.objectId}
                                    larger={true}
                                    targetPrefix={
                                        "/" + appHostedSegment + "/language:"
                                    }
                                    role="option"
                                />
                            ) : (
                                <div
                                    css={css`
                                        height: 125px;
                                        width: 150px;
                                        margin: 0 20px 20px 0;
                                    `}
                                ></div>
                            )
                        )}
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
                                        onFocus={() =>
                                            setShowPreferredLangs(false)
                                        }
                                        onBlur={() => {
                                            setShowPreferredLangs(true);
                                            // Note: must override this, even if we don't need the above line.
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
