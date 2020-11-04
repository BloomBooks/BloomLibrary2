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
import { getLegacyThumbnailUrl, getThumbnailUrl } from "./ArtifactHelper";
import { FormattedMessage, useIntl } from "react-intl";
import { LicenseLink } from "./LicenseLink";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { ShowLoginDialog } from "../User/LoginDialog";
import { sendConcernEmail } from "../../connection/ParseServerConnection";

// Manages a dialog used to report problems/concerns with Bloom Books.
export const ReportDialog: React.FunctionComponent<{
    book: Book;
    open: boolean; // dialog is displayed when rendered with this true
    close: () => void; // Should result in being re-rendered with open false
    contextLangIso?: string; // if we know the user is working with books in a particular language, this tells which one.
}> = props => {
    const l10n = useIntl();
    const { thumbnailUrl } = getThumbnailUrl(props.book);
    const [reportContent, setReportContent] = useState("");
    const legacyStyleThumbnail = getLegacyThumbnailUrl(props.book);
    const user = LoggedInUser.current;
    const loggedIn = !!user;
    return (
    <Dialog
        open={props.open}
        onClose={() => props.close()}
    >
        <DialogContent>
            {loggedIn &&
            (<DialogContentText id="report-problem">
                 {/* This code is very similar to parts of BookDetailHeaderGroup and MetadataGroup.
                 It might be worth extracting what is common, but it may also be better to keep
                 the flexibility of having just the parts we want here. */}
                <img
                    // Don't provide an alt unless the src is missing.  See BL-8963.
                    alt={
                        thumbnailUrl
                            ? ""
                            : l10n.formatMessage({
                                    id: "book.detail.thumbnail",
                                    defaultMessage: "book thumbnail",
                                })
                    }
                    src={thumbnailUrl}
                    onError={(ev) => {
                        // This is unlikely to be necessary now, as we have what we think is a reliable
                        // way to know whether the harvester has created a thumbnail.
                        // And eventually all books should simply have harvester thumbnails.
                        // Keeping the fall-back just in case it occasionally helps.
                        if (
                            (ev.target as any).src !== legacyStyleThumbnail
                        ) {
                            (ev.target as any).src = legacyStyleThumbnail;
                        } else {
                            console.log(
                                "ugh! no thumbnail in either place"
                            );
                        }
                    }}
                    css={css`
                        max-width: 125px;
                        max-height: 120px;

                        object-fit: contain; //cover will crop, but fill up nicely
                    `}
                />
                <h1
                    css={css`
                        font-size: 18pt;
                        margin-top: 0;
                        margin-bottom: 12px;
                    `}
                >
                    {props.book.getBestTitle(props.contextLangIso)}
                </h1>
                {props.book.summary && (<div>{l10n.formatMessage({id: "book.summary", defaultMessage: "Summary:"}) +" " + props.book.summary}</div>)}
                <div>
                <div>{props.book.copyright}</div>
                <FormattedMessage
                    id="book.metadata.license"
                    defaultMessage="License:"
                />{" "}
                <LicenseLink book={props.book} />
                </div>
                <div css={css`margin-top:30px;`}>
                <FormattedMessage

                        id="book.concerns"
                        defaultMessage="What concerns do you have about this book?"
                    />
                </div>
                <textarea css={css`width: 70%; height: 150px;`} value={reportContent} onChange={(ev) => setReportContent(ev.target.value)}></textarea>
                <div>
                    {l10n.formatMessage({
                        id:"book.repliesWillBeSent",
                        defaultMessage:"Replies will be sent to the email address you provided when you signed up:"
                    }) + " " + user?.email}
                </div>
            </DialogContentText>
            )}
            {loggedIn || (
                <DialogContentText id="please-sign-in">
                    <h1><FormattedMessage
                        id="pleaseLogIn"
                        defaultMessage="Please Sign In"
                    /></h1>
                    <FormattedMessage
                        id="useThisFunction"
                        defaultMessage="To use this function, please"
                    />
                    {" "}
                    <Button color="primary" autoFocus
                        variant="contained"
                        onClick={() => {
                            props.close();
                                ShowLoginDialog(true);
                            }}>
                        <FormattedMessage
                            id="signInToBloomLibrary"
                            defaultMessage="Sign In to Bloom Library"
                        />
                    </Button>
                </DialogContentText>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                props.close(); }
            }
            color="primary">
                {loggedIn ? l10n.formatMessage({id: "common.cancel", defaultMessage:"Cancel"}) : l10n.formatMessage({id: "common.close", defaultMessage:"Close"})}
            </Button>
            {loggedIn && (<Button variant="contained"
                onClick={() => {
                    sendConcernEmail( user!.email, reportContent, props.book.id ).then(() => {
                        alert("Your concern has been reported.")
                    })
                    .catch((e:any) => alert("Something went wrong trying to report your concern: " + e));
                    props.close(); } // todo: send it
                }
                color="primary" autoFocus>
                    {l10n.formatMessage({id: "send", defaultMessage:"Send"})}
                </Button>
            )}
        </DialogActions>
    </Dialog>
)};
