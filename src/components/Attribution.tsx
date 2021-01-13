// display an attribution for a testimonial, with an optional picture and an optional
// affiliation for the one giving the testimonial.

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";

export interface IAttributionProps extends React.HTMLAttributes<HTMLElement> {
    image?: string; // optional url of photograph
    name: string; // name of the person giving the testimonial such as "Jane Smith"
    affiliation?: string; // optional value like "University of Somewhere"
}

export const Attribution: React.FunctionComponent<IAttributionProps> = (
    props
) => {
    return (
        <div
            css={css`
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                width: 100%;
            `}
        >
            {getImageDiv(props.image)}
            <div
                css={css`
                    padding-left: 20px;
                `}
            >
                <p>
                    <em>{props.name}</em>
                    <br />
                    <em>{props.affiliation}</em>
                </p>
            </div>
        </div>
    );
};
function getImageDiv(imageUrl: string | undefined) {
    // the div layer is needed for flex-box to display properly.
    return (
        <div>
            {imageUrl && (
                <img
                    css={css`
                        border-radius: 50%;
                        height: 50px;
                        width: 50px;
                    `}
                    src={imageUrl}
                    alt="speaker"
                />
            )}
        </div>
    );
}
