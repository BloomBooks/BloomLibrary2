// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { IFilter } from "../IFilter";
import * as ReactImage from "react-image";
import { BookCount } from "./BookCount";

interface IProps {
    title: string;
    bookCount?: string;
    filter: IFilter;
    pageType: string;
    img: string;
}

const CategoryCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    // some bookshelves have multiple levels, separated by "/". For now,
    // just use the last part.
    const parts = props.title.split("/");
    const title = parts[parts.length - 1];

    const titleElementIfNoImage = (
        <h2
            css={css`
                text-align: center;
                flex-grow: 1; // push the rest to the bottom5
            `}
        >
            {title}
        </h2>
    );

    return (
        <CheapCard
            css={css`
                width: 220px;
                padding: 10px;
            `}
            onClick={() => {
                //alert("click " + this.props.title);
                router!.push({
                    title: props.title,
                    pageType: props.pageType ? props.pageType : "category",
                    filter: props.filter
                });
            }}
        >
            {/* We want to show an image for the category if we have one */}
            <ReactImage
                src={props.img}
                css={css`
                    max-height: 129px;
                    max-width: 198px;
                    margin-left: auto;
                    margin-right: auto;
                `}
                // While we're waiting, show the text title
                loader={titleElementIfNoImage}
                // If we could not get an image, show the text title
                unloader={titleElementIfNoImage}
            />

            <div
                css={css`
                    margin-top: auto;
                    text-align: center;
                `}
            >
                <BookCount message={`{0} Books`} filter={props.filter} />
            </div>
        </CheapCard>
    );
};

export default CategoryCard;
