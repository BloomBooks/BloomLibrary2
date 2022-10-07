// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { ILanguage, getDisplayNamesForLanguage } from "../model/Language";
import { commonUI } from "../theme";
import { useResponsiveChoice } from "../responsiveUtilities";
import { FormattedMessage } from "react-intl";
import TruncateMarkup from "react-truncate-markup";
import { ICardSpec, useBaseCardSpec } from "./CardGroup";
import { SmartTruncateMarkup } from "./SmartTruncateMarkup";
import { useIsAppHosted } from "./appHosted/AppHostedUtils";

export function useLanguageCardSpecs(larger?: boolean): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    return {
        cardWidthPx: larger ? 150 : (getResponsiveChoice(100, 150) as number),
        cardHeightPx: larger ? 125 : (getResponsiveChoice(90, 125) as number),
        cardSpacingPx: useBaseCardSpec().cardSpacingPx,
    };
}

export const LanguageCard: React.FunctionComponent<
    ILanguage & {
        role?: string; // accessibility role, passed on as part of propsToPassDown
        // if not null, what to use before lang id in target URL
        // For example, this allows a language card in app-hosted mode to link to a page still in app-hosted mode.
        targetPrefix?: string;
        larger?: boolean;
        className?: string;
        primaryTextColorOverride?: string;
        secondaryTextColorOverride?: string;
    }
> = (props) => {
    const {
        name,
        isoCode,
        usageCount,
        englishName,
        targetPrefix,
        ...propsToPassDown
    } = props; // Prevent React warnings

    const { primary, secondary } = getDisplayNamesForLanguage(props);
    const getResponsiveChoice = useResponsiveChoice();
    const { cardWidthPx, cardHeightPx } = useLanguageCardSpecs(props.larger);
    const urlPrefix = props.targetPrefix ?? "/language:";
    const showCount = !useIsAppHosted();
    const cardSpacing = useBaseCardSpec().cardSpacingPx;

    // In the main website, we want language cards to be responsive: smaller and with smaller text on small screens.
    // In the language chooser intended to be embedded in BloomReader, we want larger sizes.
    // The description said "about a third larger" which happens to be, for most measurements, what the large-screen
    // size already was. But as long as I was messing with it, I decided to support an actually distinct size
    // for the BloomReader ("props.larger") view, and specify it in REMs which is current best-practice. The REM values are chosen
    // to make the BR font size the same as the large-screen size, unless the user has configured a non-standard
    // font setting in the browser (which I'm not sure is possible in BR, but it may inherit some system setting).
    const chooseSize = (
        larger: string,
        smallScreen: string,
        largeScreen: string
    ): string =>
        props.larger
            ? larger
            : (getResponsiveChoice(smallScreen, largeScreen) as string);
    return (
        <CheapCard
            {...propsToPassDown} // makes swiper work
            css={css`
                // Width was chosen for "portuguese" to fit on one line in mobile
                // and desktop
                width: ${cardWidthPx}px;
                // When choosing a height, search on "x-" to see some tall ones
                height: ${cardHeightPx}px;
                // This guarantees that on very narrow screens we get at least two cards per row.
                // See BL-11573 for some bad effects of not fitting at least two in the app-hosted
                // language group embedded in Bloom Reader.
                max-width: calc(50% - ${cardSpacing}px);
                padding: ${chooseSize(
                    commonUI.paddingForCollectionAndLanguageCardsPx + "px",
                    commonUI.paddingForSmallCollectionAndLanguageCardsPx + "px",
                    commonUI.paddingForCollectionAndLanguageCardsPx + "px"
                )};
            `}
            textColorOverride={props.primaryTextColorOverride}
            url={`${urlPrefix}${props.isoCode}`}
            onClick={undefined} // we just want to follow the href, whatever might be in propsToPassDown
        >
            <div
                css={css`
                    font-size: ${chooseSize("1rem", "9pt", "12pt")};
                    // allows the child, the actual secondary name, to be absolute positioned to the bottom
                    position: relative;
                    height: ${chooseSize(
                        "35px",
                        "25px",
                        "35px"
                    )}; // push the next name, the primary name, into the center of the card
                    margin-bottom: 5px;
                `}
            >
                <div
                    css={css`
                        margin-top: auto;
                        position: absolute;
                        bottom: 0;
                        color: ${props.secondaryTextColorOverride
                            ? props.secondaryTextColorOverride
                            : commonUI.colors.minContrastGray};
                        line-height: 1em;
                    `}
                >
                    <SmartTruncateMarkup
                        condition={(secondary ?? "").length >= 18}
                        lines={2}
                    >
                        <span>{secondary}</span>
                    </SmartTruncateMarkup>
                </div>
            </div>
            <h2
                css={css`
                    font-size: ${chooseSize("1.333rem", "9pt", "16pt")};
                    //text-align: center;
                    max-height: 40px;
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-block-start: 0;
                    margin-block-end: 0;
                    line-height: 1em;
                `}
            >
                <TruncateMarkup lines={2}>
                    <span> {primary} </span>
                </TruncateMarkup>
            </h2>
            <div
                css={css`
                    font-size: ${chooseSize("0.875rem", "10px", "14px")};
                    position: absolute;
                    bottom: 4px;
                `}
            >
                {props.usageCount && showCount ? (
                    <FormattedMessage
                        id="bookCount"
                        defaultMessage="{count} books"
                        values={{ count: props.usageCount }}
                    />
                ) : (
                    ""
                )}
            </div>
        </CheapCard>
    );
};
