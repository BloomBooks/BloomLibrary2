import { Book } from "../../model/Book";
import { BlorgLink as Link } from "../BlorgLink";
import { getAnchorProps } from "../../embedded";
import React from "react";
export const LicenseLink: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    return props.book.license ? (
        <Link
            color="secondary"
            {...getAnchorProps(
                // enhance: can we point to the actual version?
                `https://creativecommons.org/licenses/${props.book.license.replace(
                    "cc-",
                    ""
                )}/4.0/`
            )}
        >
            {props.book.license}
        </Link>
    ) : (
        <span>???</span>
    );
};
