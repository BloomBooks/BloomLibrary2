// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import { CheapCard } from "./CheapCard";
import { ICollection } from "../model/ContentInterfaces";
import { FormattedMessage } from "react-intl";
import { useResponsiveChoice } from "../responsiveUtilities";
import { commonUI } from "../theme";

// const image = css`
//     height: 100px;
//     width: 100%;
//     background-size: contain;
//     background-repeat: no-repeat;
//     background-position: center;
// `;

const cardWidth = 120;

interface IProps {
    collection: ICollection;
    skip?: number;
}
export const MoreCard: React.FunctionComponent<IProps> = (props) => {
    const href =
        "/" +
        props.collection.urlKey +
        (props.skip ? "/:skip:" + props.skip : "");

    return <MoreOrAllCard collection={props.collection} href={href} />;
};

export const MoreOrAllCard: React.FunctionComponent<{
    collection: ICollection;
    href: string;
}> = (props) => {
    const getResponsiveChoice = useResponsiveChoice();

    return (
        <CheapCard
            css={css`
                width: ${cardWidth}px;
                height: ${getResponsiveChoice(160, 190)}px;
                padding: ${commonUI.paddingForCollectionAndLanguageCardsPx}px;
            `}
            target={props.href}
        >
            {
                // Even though this might show all books, I decided to keep the same message for now.
                // It is easier on l10n and still accurate.
            }
            <FormattedMessage
                id="card.seeMore"
                defaultMessage="See more of these books."
            />
        </CheapCard>
    );
};
