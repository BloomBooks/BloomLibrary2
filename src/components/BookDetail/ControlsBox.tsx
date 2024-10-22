// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";

import { commonUI } from "../../theme";

// This is just a reusable box with a border around it.
export const ControlsBox: React.FunctionComponent<
    React.HTMLProps<HTMLDivElement>
> = (props) => {
    return (
        <div
            css={css`
                box-sizing: border-box;
                padding: 1em;
                margin-top: 20px;
                margin-bottom: 20px;
                border: 4px solid ${commonUI.colors.bloomBlue};
                border-radius: 5px;
            `}
        >
            {props.children}
        </div>
    );
};
