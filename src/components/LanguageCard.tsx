// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { ILanguage, getDisplayNamesForLanguage } from "../model/Language";
import { commonUI } from "../theme";
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
    const { displayName: languageName, autonym } = getDisplayNamesForLanguage(
        props
    );
    const languageCodeAndAlternateName = (props.isoCode.indexOf("-") > -1 &&
    props.isoCode !== props.englishName
        ? [props.isoCode, autonym]
        : [autonym]
    ).join(" ");

    return (
        <CheapCard
            {...propsToPassDown} // makes swiper work
            css={css`
                //text-align: center;
                width: 140px;
                height: ${commonUI.languageCardHeightInPx}px;
                padding: ${cardPadding};
            `}
            target={`/language:${props.isoCode}`}
            onClick={undefined} // we just want to follow the href, whatever might be in propsToPassDown
        >
            <div
                css={css`
                    font-size: 0.9rem;
                    // allows the child, the actual secondary name, to be absolute positioned to the bottom
                    position: relative;
                    height: 35px; // push the next name, the primary name, into the center of the card
                `}
            >
                <div
                    css={css`
                        margin-top: auto;
                        position: absolute;
                        bottom: 0;
                        color: ${commonUI.colors.minContrastGray};
                    `}
                >
                    {languageCodeAndAlternateName}
                </div>
            </div>
            <h2
                css={css`
                    //text-align: center;
                    max-height: 40px;
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-block-start: 0;
                    margin-block-end: 0;
                `}
            >
                <TruncateMarkup
                    // test false positives css={css`color: red;`}
                    lines={2}
                >
                    <span> {languageName} </span>
                </TruncateMarkup>
            </h2>
            <div
                css={css`
                    font-size: 0.7rem;
                    color: ${theme.palette.secondary.main};
                    position: absolute;
                    bottom: ${cardPadding};
                `}
            >
                {props.usageCount ? (
                    <FormattedMessage
                        id="bookCount"
                        defaultMessage="{count} Books"
                        values={{ count: props.usageCount }}
                    />
                ) : (
                    ""
                )}
            </div>
        </CheapCard>
    );
};
