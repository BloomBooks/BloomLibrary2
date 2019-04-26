import React, { Component, useContext } from "react";
import { css, cx } from "emotion";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { IFilter } from "../IFilter";

interface IProps {
    title: string;
    bookCount?: string;
    filter: IFilter;
}

const CategoryCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    // some bookshelfs have multiple levels, separated by "/". For now,
    // just use the last part.
    const parts = props.title.split("/");
    const title = parts[parts.length - 1];
    return (
        <CheapCard
            className={css`
                width: 220px;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.title,
                    pageType: "category",
                    filter: props.filter
                });
            }}
        >
            <h2
                className={css`
                    text-align: center;
                    flex-grow: 1; // push the rest to the bottom5
                `}
            >
                {title}
            </h2>
            <div>{props.bookCount ? `${props.bookCount} Books` : ""}</div>
        </CheapCard>
    );
};

export default CategoryCard;
