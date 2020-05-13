// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";

// const image = css`
//     height: 100px;
//     width: 100%;
//     background-size: contain;
//     background-repeat: no-repeat;
//     background-position: center;
// `;

export const cardWidth = 120;

interface IProps {
    collectionName: string;
    aspectName?: string; // e.g., "search", "language"
    aspectValue?: string; // e.g., "level:1", "es"
    subtitle?: string; // e.g., "Level 1", "Spanish"
}
export const MoreCard: React.FunctionComponent<IProps> = (props) => {
    let href = "/more/" + props.collectionName;
    if (props.aspectName && props.aspectValue) {
        href += "/" + props.aspectName + "/" + props.aspectValue;
        if (props.subtitle) {
            href += "/" + props.subtitle;
        }
    }
    return (
        <CheapCard
            css={css`
                width: ${cardWidth}px;
            `}
            href={href}
        >
            {`See more of these books.`}
        </CheapCard>
    );
};
