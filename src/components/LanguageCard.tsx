// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { ILanguage, getLanguageNames } from "../model/Language";
import { commonUI } from "../theme";
import { useTheme } from "@material-ui/core";

export const LanguageCard: React.FunctionComponent<ILanguage> = (props) => {
    const theme = useTheme();
    const { displayName: languageName, autonym } = getLanguageNames(props);

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
            href={`language/${props.isoCode}`}
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
                {props.usageCount ? `${props.usageCount} Books` : ""}
            </div>
        </CheapCard>
    );
};
