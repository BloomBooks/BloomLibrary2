// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { ILanguage } from "../model/Language";
import { commonUI } from "../theme";

export const LanguageCard: React.FunctionComponent<ILanguage> = props => {
    const router = useContext(RouterContext);
    let languageName: string;
    let autonym: string | undefined;
    if (props.englishName && props.englishName !== props.name) {
        autonym = props.name;
        languageName = props.englishName;
    } else {
        languageName = props.name;
    }

    const {
        name,
        isoCode,
        usageCount,
        englishName,
        ...propsToPassDown
    } = props; // Prevent React warnings

    return (
        <CheapCard
            {...propsToPassDown}
            css={css`
                text-align: center;
                width: 120px;
                height: ${commonUI.languageCardHeightInPx}px;
                padding-bottom: 3px;
            `}
            onClick={() => {
                router!.push({
                    title: languageName,
                    pageType: "language",
                    filter: { language: props.isoCode }
                });
            }}
        >
            <h2
                css={css`
                    text-align: center;
                    flex-grow: 1; // push the rest to the bottom
                    max-height: 40px;
                `}
            >
                {languageName}
            </h2>
            <div
                css={css`
                    margin-bottom: 15px;
                `}
            >
                {autonym}
            </div>
            <div
                css={css`
                    font-size: 0.8rem;
                    color: #1d94a4;
                `}
            >
                {props.usageCount ? `${props.usageCount} Books` : ""}
            </div>
        </CheapCard>
    );
};
