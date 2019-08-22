import React, { Component, useContext } from "react";
import { css } from "emotion";
import { CheapCard } from "./CheapCard";
import { RouterContext, IFilter } from "../Router";

const image = css`
    height: 100px;
    width: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
`;

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
            className={
                props.className +
                " " +
                css`
                    width: ${cardWidth}px;
                `
            }
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
