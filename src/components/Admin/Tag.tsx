// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";

interface IProps {
    content: string;
    delete: (tag: string) => void;
}

// This React component implements a colored oval containing the content string and a delete button.
// Clicking the button invokes the delete function, if any.
// The color of the oval is determined by an array of (regular expression, bgcolor, fgcolor) objects.
// Since we're using a span, currently the oval can line-break in the middle.
// Enhance: could make the delete function optional (and hide the button)
// Enhance: could make the (re,colors) array a prop, giving the client control over it.
export const Tag: React.FunctionComponent<IProps> = props => {
    const tagColors = [
        {
            match: /^topic:/,
            backgroundColor: "rgb(151,101,143)",
            color: "white"
        },
        {
            match: /^region:/,
            backgroundColor: "rgb(31,147,164)",
            color: "white"
        },
        { match: /problem/, backgroundColor: "rgb(235,66,45)", color: "white" },
        { match: /todo/, backgroundColor: "rgb(254,191,0)", color: "black" }, // bloom-yellow
        { match: /./, backgroundColor: "#575757", color: "white" }
    ];
    let backColor = "#575757";
    let color = "white";
    for (const tagColor of tagColors) {
        if (tagColor.match.test(props.content)) {
            backColor = tagColor.backgroundColor;
            color = tagColor.color;
            break;
        }
    }

    const handleClick = () => {
        if (props.delete) {
            props.delete(props.content);
        }
    };

    return (
        <span
            // the material-ui Button puts some space to the right of the X, hence our use
            // of padding-right:0px. If anything, we'd probably like less. If we hide the
            // delete button we might need more padding on the right.
            css={css`
                background-color: ${backColor};
                color: ${color};
                border-radius: 7px;
                margin-right: 10px;
                padding-left: 5px;
                padding-right: 0px;
            `}
        >
            {props.content}
            <IconButton onClick={handleClick}>
                <CloseIcon
                    css={css`
                        color: ${color};
                    `}
                    style={{ fontSize: "10px" }} // even !important doesn't win here
                ></CloseIcon>
            </IconButton>
        </span>
    );
};
