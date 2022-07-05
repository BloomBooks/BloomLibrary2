// Display a testimonial with a left border highlighting the text and attribution.

import { css } from "@emotion/react";

import * as React from "react";
import { ContentfulImage } from "./ContentfulImage";
import { commonUI } from "../../theme";

export const Testimonial: React.FunctionComponent<{
    imageId: string;
    name: string; // name of the person giving the testimonial such as "Jane Smith"
    affiliation?: string; // optional value like "University of Somewhere"
}> = (props) => {
    return (
        <div
            css={css`
                border-left-style: solid;
                border-left-color: ${commonUI.colors.creationArea};
                border-left-width: 3px;
                padding-left: 20px;
                margin-top: 1em;
                margin-bottom: 1em;
            `}
        >
            {props.children}

            <div
                css={css`
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    width: 100%;
                    margin-top: 1em;
                `}
            >
                <ContentfulImage
                    css={css`
                        border: solid 2px ${commonUI.colors.creationArea};
                        border-radius: 50%;
                        height: 50px;
                        width: 50px;
                        margin-right: 20px; // to separate from the name when the screen is wide enough for side-by-side
                    `}
                    id={props.imageId}
                ></ContentfulImage>

                <p>
                    <em>{props.name}</em>
                    <br />
                    <em>{props.affiliation}</em>
                </p>
            </div>
        </div>
    );
};
