// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Book } from "../../model/Book";
import React, { useState } from "react";
import { BlorgLink } from "../BlorgLink";
import { Alert } from "../Alert";
import { commonUI } from "../../theme";
export const LicenseLink: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const [alertText, setAlertText] = useState("");
    if (props.book.license === "custom") {
        return (
            <React.Fragment>
                <Alert
                    open={alertText !== ""}
                    close={() => {
                        setAlertText("");
                    }}
                    message={alertText!}
                />
                <button
                    css={css`
                        color: ${commonUI.colors.bloomBlue};
                        background: none !important;
                        border: none;
                        padding: 0 !important;
                        text-decoration: underline;
                        cursor: pointer;
                        font: inherit;
                        &:focus {
                            /* add outline to focus pseudo-class */
                            outline-style: dotted;
                            outline-width: 1px;
                        }
                    `}
                    onClick={() => setAlertText(props.book.licenseNotes)}
                >
                    custom
                </button>
            </React.Fragment>
        );
    }
    return props.book.license ? (
        <BlorgLink
            color="secondary"
            href={
                // enhance: can we point to the actual version?
                `https://creativecommons.org/licenses/${props.book.license.replace(
                    "cc-",
                    ""
                )}/4.0/`
            }
        >
            {props.book.license}
        </BlorgLink>
    ) : (
        <span>???</span>
    );
};
