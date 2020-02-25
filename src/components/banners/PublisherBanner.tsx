import css from "@emotion/css/macro";
import React from "react";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core"; // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE
/** @jsx jsx */

import { BookCount } from "../BookCount";
import { Breadcrumbs } from "../Breadcrumbs";
import { IFilter } from "../../IFilter";

// Note, Publisher & Organization may be treated differently for some things,
// but when it comes to showing a page for one of them, they are currently the same
export const PublisherBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    logoUrl?: string;
    collectionDescription: JSX.Element;
}> = props => (
    <div
        css={css`
            margin-left: 20px;
        `}
    >
        <Breadcrumbs />
        <h1
            css={css`
                font-size: 24pt;
            `}
        >
            {/* some times the logo is the name, so we don't want to repeat it in the title */}
            {props.title && <span>Publisher: {props.title}</span>}
        </h1>
        <div
            css={css`
                display: flex;
                margin-top: 20px;
            `}
        >
            {props.logoUrl && (
                <img
                    src={props.logoUrl}
                    alt={props.title}
                    css={css`
                        height: 150px;
                        margin-right: 50px;
                    `}
                />
            )}
            <div
                css={css`
                    max-width: 500px;
                    margin-top: auto;
                    margin-bottom: auto;
                `}
            >
                {props.collectionDescription}
            </div>
        </div>

        <br />
        <BookCount filter={props.filter} />
    </div>
);
