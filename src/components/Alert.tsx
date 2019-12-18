import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

export const Alert: React.FunctionComponent<{
    open: boolean;
    close: () => void;
    message: string;
}> = props => (
    <Dialog
        open={props.open}
        onClose={() => props.close()}
        aria-describedby="alert-dialog-description"
    >
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {props.message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.close()} color="primary" autoFocus>
                OK
            </Button>
        </DialogActions>
    </Dialog>
);
