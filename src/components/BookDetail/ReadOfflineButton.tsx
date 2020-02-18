// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import Button from "@material-ui/core/Button";
import BloomPubIcon from "./BloomPubWhite.svg";
import { RouterContext } from "../../Router";

interface IProps {
    id: string;
    fullWidth?: boolean;
}
export const ReadOfflineButton: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    return (
        <Button
            variant="contained"
            color="secondary"
            startIcon={
                <img
                    src={BloomPubIcon}
                    alt="bloom reader document"
                    css={css`
                        width: 35px;
                        margin-right: 10px;
                    `}
                />
            }
            size="large"
            css={css`
                width: ${props.fullWidth ? "100%" : "250px"};
                height: 80px;
                margin-bottom: 10px !important;
                float: right;
            `}
            onClick={() => alert("TODO: not implemented yet")}
        >
            <div>
                <h1
                    css={css`
                        margin-bottom: 0;
                        margin-top: 0;
                    `}
                    // css={css`
                    //     margin-bottom: 15px; /*hack without which, the text is not in the vertical center of the button with the icon*/
                    // `}
                >
                    <p
                        css={css`
                            margin-bottom: 0;
                            margin-top: 0;
                        `}
                    >
                        READ OFFLINE
                    </p>
                </h1>
                <p
                    css={css`
                        margin-bottom: 0;
                        margin-top: 0;
                        font-size: 9px;
                        text-transform: none;
                    `}
                >
                    Download into Bloom Reader
                </p>
            </div>
        </Button>
    );
};
