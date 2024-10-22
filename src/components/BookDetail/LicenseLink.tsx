// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import { Book } from "../../model/Book";
import React, { useState } from "react";
import { BlorgLink } from "../BlorgLink";
import { Alert } from "../Alert";
import Link from "@material-ui/core/Link";
import { FormattedMessage } from "react-intl";
export const LicenseLink: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const [alertText, setAlertText] = useState("");

    if (!props.book.license) return <span>???</span>;

    switch (props.book.license) {
        case "custom":
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
                        <FormattedMessage
                            id="book.metadata.license.custom"
                            defaultMessage="custom"
                            description="Describes a license which is not a creative commons license. Follows 'License: '"
                        />
                    </Link>
                </React.Fragment>
            );
        case "ask":
            return (
                <FormattedMessage
                    id="book.metadata.license.ask"
                    defaultMessage="Ask the copyright holder"
                    description="Describes a restricted license. Follows 'License: '"
                />
            );
        default:
            return (
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
            );
    }
};
