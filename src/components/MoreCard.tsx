// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { ICollection } from "../model/ContentInterfaces";
import { FormattedMessage } from "react-intl";

// const image = css`
//     height: 100px;
//     width: 100%;
//     background-size: contain;
//     background-repeat: no-repeat;
//     background-position: center;
// `;

export const cardWidth = 120;

interface IProps {
    collection: ICollection;
    skip?: number;
}
export const MoreCard: React.FunctionComponent<IProps> = (props) => {
    const href =
        "/" +
        [props.collection.urlKey] +
        (props.skip ? "/:skip:" + props.skip : "");

    return (
        <CheapCard
            css={css`
                width: ${cardWidth}px;
            `}
            target={href}
        >
            <FormattedMessage
                id="card.seeMore"
                defaultMessage="See more of these books."
            />
        </CheapCard>
    );
};
