import React, { Component } from "react";
import { css } from "emotion";
import { CheapCard } from "./CheapCard";

const image = css`
    height: 100px;
    width: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
`;

interface IProps {
    title: string;
    baseUrl: string;
}
export const BookCard: React.FunctionComponent<IProps> = props => (
    <CheapCard
        onClick={() => {}}
        className={css`
            width: 120px;
        `}
    >
        {/* For (39a) Lara the Yellow Ladybird I placed a file named "test-cover" in the bucket
        in order to play with how the cards can look once we have access to their actual cover images. */}
        <img
            className={css`
                height: 100px;
                object-fit: cover; //cover will crop, but fill up nicely
            `}
            src={props.baseUrl + "test-cover.jpg"} // we would have to generate new thumbnails that just have the image shown on the cover
            onError={ev => {
                if (props.baseUrl) {
                    (ev.target as any).src =
                        props.baseUrl + "thumbnail-256.png";
                } else {
                    console.log("what");
                }
            }}
        />

        <h2
            className={css`
                font-weight: normal;
                padding-left: 10px;
                max-height: 40px;
                overflow-y: hidden;
            `}
        >
            {props.title}
        </h2>
    </CheapCard>
);
