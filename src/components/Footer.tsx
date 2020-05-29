// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";

export const Footer: React.FunctionComponent = (props) => {
    return (
        <div
            css={css`
                padding: 20px;
                //height: 6em;
                color: white;
                background-color: black;
                display: flex;
            `}
        >
            <div>Support</div>
            <a
                href="https://www.contentful.com/"
                rel="nofollow noopener noreferrer"
                target="_blank"
                css={css`
                    margin-left: auto;
                `}
            >
                <img
                    src="https://images.ctfassets.net/fo9twyrwpveg/7Htleo27dKYua8gio8UEUy/0797152a2d2f8e41db49ecbf1ccffdaa/PoweredByContentful_DarkBackground_MonochromeLogo.svg"
                    css={css`
                        max-width: 100px;
                        width: 100%;
                    `}
                    alt="Powered by Contentful"
                />
            </a>
        </div>
    );
};
