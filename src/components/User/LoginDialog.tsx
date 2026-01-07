import React, { useState } from "react";

import { DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import { FormattedMessage } from "react-intl";
import { StyledFirebaseAuthCodeSplit } from "../../authentication/firebase/StyledFirebaseAuthCodeSplit";
import { PreLoginMessageDialog } from "./PreLoginMessageDialog";

let staticShowLoginDialog: (doOpen: boolean) => void = () => {};
export { staticShowLoginDialog as ShowLoginDialog };

const messageSeenCookieName = "BloomPreLoginMessageSeen";
function setMessageSeenCookie(): void {
    // The expiration date is actually limited to about 400 days in the future by current browser implementations,
    // but setting it to 9999 makes it effectively permanent for our purposes.
    document.cookie = `${messageSeenCookieName}=true; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT;`;
}
function getMessageSeenCookie(): string | null {
    const nameEQ = `${messageSeenCookieName}=`;
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i].trim();
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export const LoginDialog: React.FunctionComponent<{}> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMessageDialog, setShowMessageDialog] = useState(false);

    const warningSeen = getMessageSeenCookie();

    staticShowLoginDialog = (doOpen: boolean) => {
        if (warningSeen) {
            setShowMessageDialog(false);
            setIsOpen(doOpen);
        } else if (doOpen) {
            setShowMessageDialog(true);
        } else {
            setIsOpen(false);
            setShowMessageDialog(false);
        }
        setMessageSeenCookie();
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
