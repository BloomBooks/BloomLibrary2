// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { useIntl } from "react-intl";

import { useTheme } from "@material-ui/core";

// so we don't have to import firebase just for typechecking. The loggedInUser is originally a firebase.User
export type LoggedInFirebaseUser = {
    displayName?: string;
    email?: string;
    emailVerified?: boolean;
    photoURL?: string;
};

export const AvatarCircle: React.FunctionComponent<{
    buttonHeight: string;
    loggedInUser?: LoggedInFirebaseUser | null;
}> = (props) => {
    const l10n = useIntl();
    const avatarColor = useTheme().palette.secondary.main;
    const Avatar = React.lazy(
        () => import(/* webpackChunkName: "avatar" */ "react-avatar")
    );
    return (
        <div
            id="avatarCircle"
            css={css`
                border-radius: 50%;
                overflow: hidden;
                width: ${props.buttonHeight};
                height: ${props.buttonHeight};
            `}
        >
            {props.loggedInUser?.photoURL && (
                <img
                    //@ts-ignore
                    referrerPolicy="no-referrer" // for avatars to work on localHost https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic/61042200#61042200
                    src={props.loggedInUser.photoURL}
                    alt={l10n.formatMessage({
                        id: "usermenu.avatar",
                        defaultMessage: "user",
                    })}
                    css={css`
                        width: ${props.buttonHeight};
                    `}
                />
            )}
            {!props.loggedInUser?.photoURL && (
                <React.Suspense fallback={<div></div>}>
                    <Avatar
                        email={props.loggedInUser?.email ?? ""}
                        name={props.loggedInUser?.displayName ?? ""}
                        size={props.buttonHeight}
                        color={avatarColor}
                    />
                </React.Suspense>
            )}
        </div>
    );
};
