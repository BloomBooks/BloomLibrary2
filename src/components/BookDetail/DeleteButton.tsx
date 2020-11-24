// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment, useState } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import { BlorgLink as Link } from "../BlorgLink";
import { getAnchorProps } from "../../embedded";
import { observer } from "mobx-react";
import * as Sentry from "@sentry/browser";

import { Book } from "../../model/Book";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { deleteBook } from "../../connection/LibraryQueryHooks";
import { useHistory } from "react-router-dom";
import { splitPathname } from "../Routes";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { FormattedMessage, useIntl } from "react-intl";

// Needs to be observer to see log in/out
export const DeleteButton: React.FunctionComponent<{
    book: Book;
}> = observer((props) => {
    const user = LoggedInUser.current;
    const userIsUploader = user?.username === props.book.uploader?.username;

    const l10n = useIntl();
    const history = useHistory();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    function handleDelete() {
        setConfirmationDialogOpen(true);
    }

    function handleCloseConfirmationDialog(confirm: boolean) {
        setConfirmationDialogOpen(false);
        if (confirm) {
            deleteBook(props.book.id)
                .then((response) => {
                    if (response.status === 200) {
                        const { breadcrumbs } = splitPathname(
                            history.location.pathname
                        );
                        const urlParts = breadcrumbs.filter(
                            (b) => b !== "book"
                        );
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
    }

    if (user?.moderator || userIsUploader)
        return (
            <Fragment>
                <Link
                    color="secondary"
                    css={css`
                        flex-shrink: 1;
                        margin-right: 20px !important;
                        display: flex;
                        align-items: center;
                        margin-top: 10px !important;
                    `}
                    onClick={handleDelete}
                    {...getAnchorProps("")}
                >
                    <DeleteIcon
                        css={css`
                            margin-right: 3px;
                        `}
                    />
                    <FormattedMessage id="delete" defaultMessage="Delete" />
                </Link>
                <ConfirmationDialog
                    title={l10n.formatMessage({
                        id: "delete.book.confirm.title",
                        defaultMessage: "Delete this book?",
                    })}
                    confirmButtonText={l10n.formatMessage({
                        id: "delete.book.confirm.button",
                        defaultMessage: "Permanently delete this book",
                    })}
                    open={confirmationDialogOpen}
                    onClose={handleCloseConfirmationDialog}
                >
                    <FormattedMessage
                        id="delete.book.confirm.message"
                        defaultMessage="If you continue, this version of the book <em>{title}</em> will be removed from BloomLibrary.org. There is no way to undo this except by uploading it again."
                        values={{
                            em: (chunks: string) => <em>{chunks}</em>,
                            title: props.book.title,
                        }}
                    />
                </ConfirmationDialog>
            </Fragment>
        );
    return <Fragment />;
});
