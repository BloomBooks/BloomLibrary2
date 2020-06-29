// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export const ConfirmationDialog: React.FunctionComponent<{
    title: string;
    content: JSX.Element;
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
                        {props.content}
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
                        // Make it left aligned. Override MUI right alignment.
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
