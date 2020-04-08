// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

/* eslint-disable jsx-a11y/anchor-is-valid */
import { RouterContext } from "../Router";
import React, { useContext } from "react";

export const Breadcrumbs: React.FunctionComponent = () => {
    const router = useContext(RouterContext);
    if (!router) {
        throw new Error(
            "Breadcrumbs found that there is no Router defined in a RouterContext. If this is a story, see the examples using an AddDecorator()"
        );
    }
    return (
        <ul css={breadcrumbsStyle}>
            {router!.breadcrumbStack.map((l) => (
                <li key={l.title}>
                    <a
                        css={css`
                            text-decoration: none !important;
                        `}
                        target="_blank"
                        // todo: seems we're supposed to make this a button that looks like a link for accessibility
                        onClick={() => {
                            router!.goToBreadCrumb(l);
                        }}
                    >
                        {l.title}
                    </a>
                </li>
            ))}
        </ul>
    );
};

// TODO: this doesn't look good on a narrow screen (phone) when the breadcrumbs get very long.
const breadcrumbsStyle = css`
    display: flex;
    padding: 0;
    margin: 0; // better to let the consumer decide our margin
    //padding-left: 20px;
    margin-top: 5px;
    li {
        margin-right: 3px;
        //color: whitesmoke;
        &:after {
            margin-left: 3px;
            margin-right: 3px;
            content: "›";
        }
    }

    li:last-child::after {
        color: transparent;
    }
`;
