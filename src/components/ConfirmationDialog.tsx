import { css } from "@emotion/react";

import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export const ConfirmationDialog: React.FunctionComponent<{
    title: string;
    confirmButtonText?: string;
    open: boolean;
    onClose: (confirm: boolean) => void;
}> = (props) => {
    const handleClose = (confirm: boolean = false) => {
        props.onClose(confirm);
    };

    return (
        <div>
            <Dialog open={props.open} onClose={() => handleClose()}>
                <DialogTitle
                    // Override MUI gray
                    css={css`
                        background-color: unset !important;
                    `}
                >
                    {props.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        // Override MUI semi-transparency
                        css={css`
                            color: unset !important;
                        `}
                    >
                        {props.children}
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    // Override MUI gray
                    css={css`
                        background-color: unset !important;
                    `}
                >
                    <Button
                        onClick={() => handleClose(true)}
                        color="primary"
                        // Make it left aligned. (Override MUI right alignment.)
                        // This is appropriate currently because our only use of this
                        // dialog is to confirm a destructive action (delete a book).
                        // It may need to parameterized if/when there are other uses.
                        css={css`
                            margin-right: auto !important;
                        `}
                    >
                        {props.confirmButtonText || "OK"}
                    </Button>
                    <Button
                        onClick={() => handleClose()}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
