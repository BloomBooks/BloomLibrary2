// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { ReactElement } from "react";
import LazyLoad from "react-lazyload";
import { CardSwiper } from "./CardSwiper";

interface IProps {
    title: string;
    children: ReactElement[];
}

export const CardGroup: React.FunctionComponent<IProps> = (props) => {
    const rowHeight = 258; // todo derive from commonui.something
    return (
        // Enhance: LazyLoad has parameters (height and offset) that should help
        // but so far I haven't got them to work well. It has many other
        // parameters too that someone should look into. Make sure to test
        // with the phone sizes in the browser debugger, and have the network
        // tab open, set to "XHR". That will show you when a new query happens
        // because this has loaded a new BookGroupInner.
        // If the params are good, this list will grow as you scroll.
        // If the params are bad, some groups at the end will NEVER show.

        // Set offset to keep one more item expanded, so keyboard shortcuts can find them
        // Set placeholder so that ul child items are of correct accessible class.
        // Note that explicit placeholders must control their own height.

        /* Note, this currently breaks strict mode. See app.tsx */
        <LazyLoad height={rowHeight}
             offset={rowHeight}
             placeholder={<li className="placeholder" style={{height:`${rowHeight}px`}}></li>}
             >
            <li
                css={css`
                    margin-top: 30px;
                `}
            >
                <h1>{props.title}</h1>
                <ul
                    css={css`
                        list-style: none;
                        padding-left: 0;
                    `}
                >
                    <CardSwiper>{props.children}</CardSwiper>
                </ul>
            </li>
        </LazyLoad>
    );
};
