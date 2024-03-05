// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment, useEffect, useState } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react-lite";

import { DeleteButton } from "./DeleteButton";
import { FormattedMessage, useIntl } from "react-intl";
import { commonUI } from "../../theme";
import { Button, Checkbox, FormControlLabel } from "@material-ui/core";
import { ReactComponent as DraftIcon } from "../../assets/DRAFT-Stamp.svg";
import { Alert } from "@material-ui/lab";
import { BlorgLink } from "../BlorgLink";
import { BookExtraPanels } from "./BookExtraPanels";
import { AvatarCircle, LoggedInFirebaseUser } from "../User/AvatarCircle";
import { User, useGetUserIsModerator } from "../../connection/LoggedInUser";
import { getCurrentUser } from "../../authentication/firebase/firebase";
import firebase from "firebase/compat/app";
import {
    IUserBookPermissions,
    useGetPermissions,
} from "../../connection/LibraryQueryHooks";

// This should become true or just be removed once 5.7 is shipping.
// The controls it hides require 5.7, so we don't want ordinary users to see them until then.
// We do want to be able to test this on our dev site, though.
const bloom57IsShipping =
    window.location.hostname.startsWith("dev") ||
    window.location.hostname.startsWith("localhost");

export const BookOwnerControlsBox: React.FunctionComponent<{
    book: Book;
    user: User;
    showDownloadDialog: any; // pass down the ref
}> = observer((props) => {
    const l10n = useIntl();
    const [firebaseUser, setFirebaseUserUrl] = useState<firebase.User | null>(
        null
    );
    useEffect(() => {
        getCurrentUser().then((currentUser) => {
            if (currentUser !== null) {
                setFirebaseUserUrl(currentUser);
            }
        });
    }, [props.user]);
    const userIsUploader =
        props.user.username === props.book.uploader?.username;
    const userIsModerator = useGetUserIsModerator();
    const permissions: IUserBookPermissions = useGetPermissions(
        !!firebaseUser,
        props.book.id
    );
    if (
        userIsModerator ||
        userIsUploader ||
        // permissions.editSurfaceMetadata === true ||
        permissions.reupload === true ||
        permissions.delete === true
    ) {
        return (
            <div
                css={css`
                    box-sizing: border-box;
                    padding: 1em;
                    margin-top: 20px;
                    margin-bottom: 20px;
                    border: 4px solid ${commonUI.colors.bloomBlue};
                    border-radius: 5px;
                `}
            >
                <div>
                    <div
                        css={css`
                            display: flex;
                            align-items: center;
                        `}
                    >
                        <AvatarCircle
                            buttonHeight="28px"
                            loggedInUser={firebaseUser as LoggedInFirebaseUser}
                        ></AvatarCircle>
                        <h1
                            id={"book.detail.youHavePermission"}
                            css={css`
                                color: ${commonUI.colors.bloomBlue};
                                margin-top: 0;
                                margin-bottom: 0;
                                display: inline-block;
                                margin-left: 10px;
                            `}
                        >
                            You have permission to modify this book
                        </h1>
                    </div>
                    {(userIsModerator || userIsUploader) && (
                        <>
                            <h2
                                css={css`
                                    margin-bottom: 0;
                                    color: ${commonUI.colors.bloomBlue};
                                `}
                                id="book.detail.draft"
                            >
                                Draft
                            </h2>
                            <FormControlLabel
                                css={css`
                                    margin-top: 5px;
                                `}
                                control={
                                    <Checkbox
                                        css={css`
                                            padding-top: 0;
                                            margin-right: -5px;
                                            padding-right: 1px;
                                        `}
                                        checked={props.book.draft}
                                        onChange={(e) => {
                                            props.book.draft = e.target.checked;
                                            props.book.saveAdminDataToParse();
                                        }}
                                    />
                                }
                                label={
                                    <div
                                        css={css`
                                            display: flex;
                                        `}
                                    >
                                        <DraftIcon
                                            css={css`
                                                width: 54px;
                                            `}
                                        />
                                        <div>
                                            {l10n.formatMessage({
                                                id:
                                                    "book.detail.draftDescription",
                                                defaultMessage:
                                                    "Do not show this book to the public yet. I will share its URL with reviewers for feedback.",
                                                description:
                                                    "Label for a check box which, if checked, marks the book as 'DRAFT' and prevents the book from showing in most views",
                                            })}
                                        </div>
                                    </div>
                                }
                            />
                        </>
                    )}
                    <div
                        css={css`
                            display: flex;
                            flex-direction: column;
                        `}
                    >
                        <h2
                            css={css`
                                margin-bottom: 0;
                                color: ${commonUI.colors.bloomBlue};
                            `}
                            id="book.detail.editing"
                        >
                            Editing
                        </h2>
                        <Alert severity="info">
                            <div>
                                <FormattedMessage
                                    id={"book.detail.updateBookNotice"}
                                    defaultMessage={
                                        "If you want to update this book with any changes, just upload it again from Bloom, using the same account. Your new version will replace this one."
                                    }
                                />
                            </div>
                            {bloom57IsShipping &&
                                permissions.reupload === true && (
                                    <div
                                        css={css`
                                            margin-top: 10px;
                                        `}
                                    >
                                        <FormattedMessage
                                            id={
                                                "book.detail.getForEditBookNotice"
                                            }
                                            defaultMessage={
                                                "If necessary, we can give you the book to edit in Bloom. You must first have Bloom 5.7 or greater installed ({downloadLink})."
                                            }
                                            values={{
                                                downloadLink: (
                                                    <BlorgLink
                                                        href="page/create/downloads"
                                                        css={css`
                                                            color: ${commonUI
                                                                .colors
                                                                .bloomBlue};
                                                        `}
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                "book.detail.downloadLink"
                                                            }
                                                            defaultMessage={
                                                                "Download Bloom"
                                                            }
                                                        />
                                                    </BlorgLink>
                                                ),
                                            }}
                                        />
                                    </div>
                                )}
                        </Alert>
                        {bloom57IsShipping && (
                            <Button
                                onClick={() =>
                                    props.showDownloadDialog.current?.()
                                }
                                color="secondary"
                                variant="outlined"
                                css={css`
                                    align-self: flex-end;
                                    margin-top: 5px;
                                `}
                            >
                                <FormattedMessage
                                    id={"book.detail.editDownload"}
                                    defaultMessage={
                                        "Download into Bloom for editing"
                                    }
                                />
                            </Button>
                        )}
                    </div>
                </div>
                <BookExtraPanels book={props.book} />
                {(userIsModerator || permissions.delete === true) && (
                    <div
                        css={css`
                            margin-top: 30px;
                        `}
                    >
                        <DeleteButton book={props.book} />
                    </div>
                )}
            </div>
        );
    }
    return <Fragment />;
});
