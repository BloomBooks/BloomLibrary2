import React, { Component, useContext } from "react";
import { css, cx } from "emotion";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";

interface IProps {
    name: string;
    bookCount: string;
}

export const LanguageCard: React.SFC<IProps> = props => {
    const router = useContext(RouterContext);

    return (
        <CheapCard
            className={css`
                width: 120px;
                height: 100px;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.name,
                    pageType: "language",
                    filter: {}
                });
            }}
        >
            <h2
                className={css`
                    text-align: center;
                    flex-grow: 1; // push the rest to the bottom5
                `}
            >
                {props.name}
            </h2>
            <div>{props.bookCount ? `${props.bookCount} Books` : ""}</div>
        </CheapCard>
    );
};
