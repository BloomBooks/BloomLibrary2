// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Book } from "../../model/Book";
import { FormattedMessage, useIntl } from "react-intl";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { ShowLoginDialog } from "../User/LoginDialog";
import { sendConcernEmail } from "../../connection/ParseServerConnection";
import { BookThumbnail } from "./BookThumbnail";

// Manages a dialog used to report problems/concerns with Bloom Books.
export const ReportDialog: React.FunctionComponent<{
    book: Book;
    open: boolean; // dialog is displayed when rendered with this true
    close: () => void; // Should result in being re-rendered with open false
    contextLangTag?: string; // if we know the user is working with books in a particular language, this tells which one.
}> = (props) => {
    const l10n = useIntl();
    const [reportContent, setReportContent] = useState("");
    const user = LoggedInUser.current;
    const loggedIn = !!user;
    const pleaseSignInFrame = l10n.formatMessage({
        id: "toUseThisSignIn",
        defaultMessage:
            "To use this function, please /Sign In to Bloom Library/",
    });
    const parts = pleaseSignInFrame.split("/");
    const beforeSignInButton = parts[0];
    const signInButtonText = parts[1] || "Sign in to Bloom Library"; // fall back in case translator forgets slashes
    const afterSignInButton = parts[2] || "";
    return (
        <Dialog open={props.open} onClose={() => props.close()}>
            <DialogContent>
                {loggedIn && (
                    <DialogContentText id="report-problem">
                        {/* This code is very similar to parts of BookDetailHeaderGroup and MetadataGroup.
                 It might be worth extracting what is common, but it may also be better to keep
                 the flexibility of having just the parts we want here. */}
                        <BookThumbnail book={props.book} />
                        <h1
                            css={css`
                                font-size: 18pt;
                                margin-top: 0;
                                margin-bottom: 12px;
                                color: black;
                            `}
                        >
                            {props.book.getBestTitle(props.contextLangTag)}
                        </h1>
                        {props.book.summary && (
                            <div>
                                {l10n.formatMessage({
                                    id: "book.summary",
                                    defaultMessage: "Summary:",
                                }) +
                                    " " +
                                    props.book.summary}
                            </div>
                        )}
                        <div
                            css={css`
                                margin-top: 30px;
                                color: black;
                            `}
                        >
                            <FormattedMessage
                                id="book.concerns"
                                defaultMessage="What concerns do you have about this book?"
                            />
                        </div>
                        <textarea
                            css={css`
                                width: 70%;
                                height: 150px;
                            `}
                            value={reportContent}
                            onChange={(ev) => setReportContent(ev.target.value)}
                        ></textarea>
                        <div>
                            {l10n.formatMessage({
                                id: "book.repliesWillBeSent",
                                defaultMessage:
                                    "Replies will be sent to the email address you provided when you signed up:",
                            }) +
                                " " +
                                user?.email}
                        </div>
                    </DialogContentText>
                )}
                {loggedIn || (
                    <DialogContentText id="please-sign-in">
                        <h1>
                            <FormattedMessage
                                id="pleaseSignIn"
                                defaultMessage="Please Sign In"
                            />
                        </h1>
                        {beforeSignInButton}
                        <Button
                            color="primary"
                            autoFocus
                            variant="contained"
                            onClick={() => {
                                props.close();
                                ShowLoginDialog(true);
                            }}
                        >
                            {signInButtonText}
                        </Button>
                        {afterSignInButton}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        props.close();
                    }}
                    color="primary"
                >
                    {loggedIn
                        ? l10n.formatMessage({
                              id: "common.cancel",
                              defaultMessage: "Cancel",
                          })
                        : l10n.formatMessage({
                              id: "common.close",
                              defaultMessage: "Close",
                          })}
                </Button>
                {loggedIn && (
                    <Button
                        variant="contained"
                        disabled={!reportContent}
                        onClick={() => {
                            sendConcernEmail(
                                user!.email,
                                reportContent,
                                props.book.id
                            )
                                .then(() => {
                                    alert(
                                        l10n.formatMessage({
                                            id: "concernReported",
                                            defaultMessage:
                                                "Your concern has been reported.",
                                        })
                                    );
                                })
                                // This should not normally happen, so not worth internationalizing?
                                .catch((e: any) =>
                                    alert(
                                        "Something went wrong trying to report your concern: " +
                                            e
                                    )
                                );
                            props.close();
                        }}
                        color="primary"
                        autoFocus
                    >
                        {l10n.formatMessage({
                            id: "send",
                            defaultMessage: "Send",
                        })}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
