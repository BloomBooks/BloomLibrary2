import React from "react";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Snackbar } from "@material-ui/core";

// A message that floats over the bottom of every page, for something the person viewing the
// site should know about (e.g. that this is a preview site, or that their API calls go to
// staging). Pass the message, and any link, as children. Without onClose it has no close
// button and stays until the page goes away. bottomOffset (px) raises it, so that two banners
// shown at once can sit one above the other.
export const OverlayBanner: React.FunctionComponent<{
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
    bottomOffset?: number;
}> = (props) => {
    return (
        <Snackbar open={true} style={{ marginBottom: props.bottomOffset }}>
            <Alert
                variant="filled"
                severity="info"
                elevation={6}
                onClose={props.onClose}
                css={{ "& a": { color: "white" } }}
            >
                <AlertTitle>{props.title}</AlertTitle>
                {props.children}
            </Alert>
        </Snackbar>
    );
};
