// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";

interface IProps {
    name: string;
    bookCount: string;
    languageCode: string;
}

export const LanguageCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);

    return (
        <CheapCard
            css={css`
                width: 120px;
                height: 100px;
                //background-color: #9ed0b8;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.name,
                    pageType: "language",
                    filter: { language: props.languageCode }
                });
            }}
        >
            <h2
                css={css`
                    text-align: center;
                    flex-grow: 1; // push the rest to the bottom5
                `}
            >
                {props.name}
            </h2>
            <div
                css={css`
                    text-align: center;
                `}
            >
                {props.bookCount ? `${props.bookCount} Books` : ""}
            </div>
        </CheapCard>
    );
};
