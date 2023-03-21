import React, { useState } from "react";

import { DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import { FormattedMessage } from "react-intl";
import { StyledFirebaseAuthCodeSplit } from "../../authentication/firebase/StyledFirebaseAuthCodeSplit";

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
                <div>
                    <StyledFirebaseAuthCodeSplit
                        loginComplete={() => staticShowLoginDialog(false)}
                    />
                </div>
            )}
        </Dialog>
    );
};
