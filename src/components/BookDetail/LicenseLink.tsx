import { Book } from "../../model/Book";
import { Link } from "@material-ui/core";
import React from "react";
export const LicenseLink: React.FunctionComponent<{
    book: Book;
}> = props => {
    return props.book.license ? (
        <Link
            color="secondary"
            target="_blank"
            rel="noopener noreferrer"
            href={
                // enhance: can we point to the actual version?
                `https://creativecommons.org/licenses/${props.book.license.replace(
                    "cc-",
                    ""
                )}/4.0/`
            }
        >
            {props.book.license}
        </Link>
    ) : (
        <span>???</span>
    );
};
