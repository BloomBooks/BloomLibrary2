// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext, Router } from "../Router";
import { ILanguage, getLanguageNames } from "../model/Language";
import { commonUI } from "../theme";

export function routeToLanguage(language: ILanguage, router: Router) {
    const { displayName } = getLanguageNames(language);

    router.push({
        title: displayName,
        pageType: "language",
        filter: { language: language.isoCode }
    });
}

export const LanguageCard: React.FunctionComponent<ILanguage> = props => {
    const router = useContext(RouterContext);
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
            {...propsToPassDown}
            css={css`
                text-align: center;
                width: 120px;
                height: ${commonUI.languageCardHeightInPx}px;
                padding-bottom: 3px;
            `}
            onClick={() => {
                routeToLanguage(props, router!);
            }}
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
                    color: #1d94a4;
                    margin-top: auto;
                `}
            >
                {props.usageCount ? `${props.usageCount} Books` : ""}
            </div>
        </CheapCard>
    );
};
