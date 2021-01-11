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
import { useTheme } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import TruncateMarkup from "react-truncate-markup";

interface ILanguageWithRole extends ILanguage {
    role?: string; // accessibility role, passed on as part of propsToPassDown
}

export const LanguageCard: React.FunctionComponent<ILanguageWithRole> = (
    props
) => {
    const theme = useTheme();

    const {
        name,
        isoCode,
        usageCount,
        englishName,
        ...propsToPassDown
    } = props; // Prevent React warnings
    const cardPadding = "14px";
    const { primary, secondary } = getDisplayNamesForLanguage(props);
    const getResponsiveChoice = useResponsiveChoice();
    return (
        <CheapCard
            {...propsToPassDown} // makes swiper work
            css={css`
                // Width was chosen for "portuguese" to fit on one line in mobile
                // and desktop
                width: ${getResponsiveChoice(100, 150)}px;
                // When choosing a height, search on "x-" to see some tall ones
                height: ${getResponsiveChoice(90, 125)}px;
                padding: ${cardPadding};
            `}
            target={`/language:${props.isoCode}`}
            onClick={undefined} // we just want to follow the href, whatever might be in propsToPassDown
        >
            <div
                css={css`
                    font-size: ${getResponsiveChoice(9, 12)}pt;
                    // allows the child, the actual secondary name, to be absolute positioned to the bottom
                    position: relative;
                    height: ${getResponsiveChoice(
                        25,
                        35
                    )}px; // push the next name, the primary name, into the center of the card
                    margin-bottom: 5px;
                `}
            >
                <div
                    css={css`
                        margin-top: auto;
                        position: absolute;
                        bottom: 0;
                        color: ${commonUI.colors.minContrastGray};
                        line-height: 1em;
                    `}
                >
                    {/* in small mode didn't work, allowed 3 lines <TruncateMarkup lines={2}>
                    I think the rare 3 line cases (search for "x-") look ok.

                        <span>{secondary}</span>
                    </TruncateMarkup> */}
                    {secondary}
                </div>
            </div>
            <h2
                css={css`
                    font-size: ${getResponsiveChoice(9, 16)}pt;
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
                    font-size: ${getResponsiveChoice(10, 14)}px;

                    position: absolute;
                    bottom: ${cardPadding};
                `}
            >
                {props.usageCount ? (
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
