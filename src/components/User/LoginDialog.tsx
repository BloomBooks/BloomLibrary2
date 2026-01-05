import React, { useState } from "react";

import { DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import { FormattedMessage } from "react-intl";
import { StyledFirebaseAuthCodeSplit } from "../../authentication/firebase/StyledFirebaseAuthCodeSplit";
import { PreLoginMessageDialog } from "./PreLoginMessageDialog";

let staticShowLoginDialog: (doOpen: boolean) => void = () => {};
export { staticShowLoginDialog as ShowLoginDialog };

export const LoginDialog: React.FunctionComponent<{}> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMessageDialog, setShowMessageDialog] = useState(false);

    staticShowLoginDialog = (doOpen: boolean) => {
        if (doOpen) {
            setShowMessageDialog(true);
        } else {
            setIsOpen(false);
            setShowMessageDialog(false);
        }
    };

    const handleContinue = () => {
        setShowMessageDialog(false);
        setIsOpen(true);
    };

    return (
        <>
            <PreLoginMessageDialog
                open={showMessageDialog}
                onClose={handleContinue}
                onContinue={handleContinue}
            />

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
                    <div>
                        <StyledFirebaseAuthCodeSplit
                            loginComplete={() => staticShowLoginDialog(false)}
                        />
                    </div>
                )}
            </Dialog>
        </>
    );
};
