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

interface ILanguageWithRole extends ILanguage  {
    role?:string; // accessibility role, passed on as part of propsToPassDown
}

export const LanguageCard: React.FunctionComponent<ILanguageWithRole> = (props) => {
    const theme = useTheme();
    const { displayName: languageName, autonym } = getDisplayNamesForLanguage(
        props
    );

    const {
        name,
        isoCode,
        usageCount,
        englishName,
        ...propsToPassDown
    } = props; // Prevent React warnings

    return (
        <CheapCard
            {...propsToPassDown} // makes swiper work
            css={css`
                text-align: center;
                width: 120px;
                height: ${commonUI.languageCardHeightInPx}px;
                padding-bottom: 3px;
            `}
            target={`/language:${props.isoCode}`}
            onClick={undefined} // we just want to follow the href, whatever might be in propsToPassDown
        >
            <h2
                css={css`
                    text-align: center;
                    max-height: 40px;
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-block-start: 0;
                    margin-block-end: 0;
                `}
            >
                {languageName}
            </h2>
            {props.isoCode.indexOf("-") > -1 &&
                props.isoCode !== props.englishName && (
                    <div
                        css={css`
                            font-size: 0.7rem;
                        `}
                    >
                        {props.isoCode}
                    </div>
                )}
            <div
                css={css`
                    font-size: 0.9rem;
                    margin-top: 5px;
                `}
            >
                {autonym}
            </div>
            <div
                css={css`
                    font-size: 0.8rem;
                    color: ${theme.palette.secondary.main};
                    margin-top: auto;
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
