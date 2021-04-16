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
import Link from "@material-ui/core/Link";
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
                <Link
                    // Not a BlorgLink (or any ordinary link) because we don't have an href
                    // These tricks are needed to make it look more like BlorgLink.
                    css={css`
                        font-family: inherit;
                        font-size: inherit;
                        margin-top: -1px;
                    `}
                    component="button" // makes the actual HTML created be a button, so accessibility checkers are happy with no HREF
                    color="secondary"
                    onClick={() => setAlertText(props.book.licenseNotes)}
                >
                    custom
                </Link>
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
