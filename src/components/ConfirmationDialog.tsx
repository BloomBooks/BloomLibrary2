import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export const ConfirmationDialog: React.FunctionComponent<{
    title: string;
    content: string;
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
                <DialogTitle>{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{props.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)} color="primary">
                        {props.confirmButtonText || "OK"}
                    </Button>
                    <Button
                        onClick={() => handleClose()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
