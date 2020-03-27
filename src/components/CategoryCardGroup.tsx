// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import LazyLoad from "react-lazyload";

interface IProps {
    title: string;
}

export const CategoryCardGroup: React.FunctionComponent<IProps> = props => {
    return (
        // Enhance: LazyLoad has parameters (height and offset) that should help
        // but so far I haven't got them to work well. It has many other
        // parameters too that someone should look into. Make sure to test
        // with the phone sizes in the browser debugger, and have the network
        // tab open, set to "XHR". That will show you when a new query happens
        // because this has loaded a new BookGroupInner.
        // If the params are good, this list will grow as you scroll.
        // If the params are bad, some groups at the end will NEVER show.

        /* Note, this currently breaks strict mode. See app.tsx */
        <LazyLoad height={258 /* todo derive from commonui.something */}>
            <li
                css={css`
                    margin-top: 30px;
                `}
            >
                <h1>{props.title}</h1>
                <ul
                    css={css`
                        list-style: none;
                        display: flex;
                        padding-left: 0;
                    `}
                >
                    {props.children}
                </ul>
            </li>
        </LazyLoad>
    );
};
