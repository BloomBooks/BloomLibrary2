import { css } from "@emotion/react";

import * as React from "react";

import { Button as MButton } from "@material-ui/core";

export const Button: React.FunctionComponent<{
    url: string;
    color?: string;
    className: string;
}> = (props) => {
    return (
        <MButton
            variant="contained"
            className={props.className || "button"}
            css={css`
                width: fit-content;
                text-decoration: none !important;
                background-color: ${props.color};
            `}
            href={props.url}
        >
            {props.children}
        </MButton>
    );
};
