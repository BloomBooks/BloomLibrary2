import React from "react";
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import { FormattedMessage } from "react-intl";

interface IPreLoginMessageDialogProps {
    open: boolean;
    onClose: () => void;
    onContinue: () => void;
}

export const PreLoginMessageDialog: React.FunctionComponent<IPreLoginMessageDialogProps> = ({
    open,
    onClose,
    onContinue,
}) => {
    return (
        <Dialog
            className="preLoginMessageDialog"
            open={open}
            onClose={onClose}
            aria-labelledby="message-title"
        >
            <DialogContent>
                <FormattedMessage
                    id="login.beforeLoginMessage"
                    defaultMessage="Are you trying to log into your account from the Bloom desktop application? Your browser may ask you for some scary permissions, but really, we're simply trying to connect to your Bloom desktop app."
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onContinue}
                    color="primary"
                    variant="contained"
                >
                    <FormattedMessage
                        id="common.continue"
                        defaultMessage="Continue"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
