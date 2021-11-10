// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { ICollection } from "../model/ContentInterfaces";
import { FormattedMessage } from "react-intl";
import { useResponsiveChoice } from "../responsiveUtilities";
import { commonUI } from "../theme";
import { useLocation } from "react-router";

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
    const getResponsiveChoice = useResponsiveChoice();
    const location = useLocation();

    let href = `/${[props.collection.urlKey]}`;
    if (href === location.pathname) {
        // This means we are the more card at the end of a long list of books (not just a row). Show everything.
        href = href + "/:all:true";
    }

    href = href + (props.skip ? "/:skip:" + props.skip : "");

    return (
        <CheapCard
            css={css`
                width: ${cardWidth}px;
                height: ${getResponsiveChoice(160, 190)}px;
                padding: ${commonUI.paddingForCollectionAndLanguageCardsPx}px;
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
