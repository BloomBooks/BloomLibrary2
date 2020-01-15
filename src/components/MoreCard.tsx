// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { IFilter } from "../IFilter";

// const image = css`
//     height: 100px;
//     width: 100%;
//     background-size: contain;
//     background-repeat: no-repeat;
//     background-position: center;
// `;

export const cardWidth = 120;

interface IProps {
    title: string;
    className?: string;
    count: number;
    filter: IFilter;
    rows: number;
}
export const MoreCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    return (
        <CheapCard
            className={props.className}
            css={css`
                width: ${cardWidth}px;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.title,
                    pageType: "more",
                    filter: props.filter,
                    rows: props.rows * 2
                });
            }}
        >
            {`See more of these books.`}
        </CheapCard>
    );
};
