// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import { Link } from "@material-ui/core";
import { observer } from "mobx-react";
import * as Sentry from "@sentry/browser";

import { Book } from "../../model/Book";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { deleteBook } from "../../connection/LibraryQueryHooks";
import { useHistory } from "react-router-dom";
import { splitPathname } from "../Routes";

// Needs to be observer to see log in/out
export const DeleteButton: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const user = LoggedInUser.current;
    const userIsUploader = user?.username === props.book.uploader?.username;

    const history = useHistory();

    function handleDelete() {
        deleteBook(props.book.id)
            .then((response) => {
                if (response.status === 200) {
                    const { breadcrumbs } = splitPathname(
                        history.location.pathname
                    );
                    const urlParts = breadcrumbs.filter((b) => b !== "book");
                    history.replace("/" + urlParts.join("/"));
                } else {
                    // At this time, it doesn't seem worthwhile to try to inform the user
                    // (come up with a meaningful message, localize it, etc.).
                    // Same below.
                    Sentry.captureException(
                        new Error(
                            `Delete book failed, status=${
                                response.status
                            }, data=${JSON.stringify(response.data)}`
                        )
                    );
                }
            })
            .catch((error) => {
                Sentry.captureException(error);
            });
    }

    if (user?.moderator || userIsUploader)
        return (
            <Link
                color="secondary"
                target="_blank"
                rel="noopener noreferrer" // copied from LicenseLink
                css={css`
                    flex-shrink: 1;
                    margin-right: 20px !important;
                    display: flex;
                    align-items: center;
                    margin-top: 10px !important;
                `}
                onClick={handleDelete}
            >
                <DeleteIcon
                    css={css`
                        margin-right: 3px;
                    `}
                />
                <div>Delete</div>
            </Link>
        );
    return <Fragment />;
});
