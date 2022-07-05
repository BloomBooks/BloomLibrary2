import { css } from "@emotion/react";

import React, { useState } from "react";

import { DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import { FormattedMessage } from "react-intl";
import { StyledFirebaseAuthCodeSplit } from "../../firebase/StyledFirebaseAuthCodeSplit";

let staticShowLoginDialog: (doOpen: boolean) => void = () => {};
export { staticShowLoginDialog as ShowLoginDialog };

export const LoginDialog: React.FunctionComponent<{}> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    staticShowLoginDialog = (doOpen: boolean) => setIsOpen(doOpen);
    return (
        <Dialog
            className="loginDialog"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            aria-labelledby="title"
        >
            <DialogTitle id="title">
                <FormattedMessage
                    id="usermenu.signIn"
                    defaultMessage="Sign In / Sign Up"
                />
            </DialogTitle>
            {isOpen && (
                <div css={css``}>
                    {/* <Button
                    variant="outlined"
                    onClick={() => {
                        firebase
                            .auth()
                            .signInWithRedirect(
                                new firebase.auth.GoogleAuthProvider()
                            );
                    }}
                >
                    Sign in with Google
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        firebase
                            .auth()
                            .signInWithRedirect(
                                new firebase.auth.EmailAuthProvider()
                            );
                    }}
                >
                    Sign in with email
                </Button> */}
                    <StyledFirebaseAuthCodeSplit
                        loginComplete={() => staticShowLoginDialog(false)}
                    />
                </div>
            )}
        </Dialog>
    );
};
