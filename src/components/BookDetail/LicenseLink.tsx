import { Book } from "../../model/Book";
import React from "react";
import { BlorgLink } from "../BlorgLink";
import { useTheme } from "@material-ui/core";
export const LicenseLink: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const theme = useTheme();
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
