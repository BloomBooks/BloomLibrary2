// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { useIntl } from "react-intl";

import firebase from "firebase/compat/app";
import { useTheme } from "@material-ui/core";

export const AvatarCircle: React.FunctionComponent<{
    buttonHeight: string; // TODO is it a string?
    loggedInUser?: firebase.User | null;
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
