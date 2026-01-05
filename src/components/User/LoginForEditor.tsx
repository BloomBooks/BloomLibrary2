import React, { useEffect } from "react";
import { ShowLoginDialog } from "./LoginDialog";
import {
    IInformEditorResult,
    useGetLoggedInUser,
} from "../../connection/LoggedInUser";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useSetBrowserTabTitle } from "../Routes";
import { isLogoutMode, logOut } from "../../authentication/authentication";
import { bringEditorToFront } from "../../editor";

export const LoginForEditor: React.FunctionComponent<{}> = observer(() => {
    const history = useHistory();
    const user = useGetLoggedInUser();
    const loggedIn = !!user;

    const [isLogout, setIsLogout] = React.useState(false);
    useEffect(() => {
        if (isLogoutMode()) {
            logOut();
            setIsLogout(true);
            bringEditorToFront();
            return;
        }

        if (!loggedIn) {
            ShowLoginDialog(true);
        } else {
            setResult(IInformEditorResult.Success);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSetBrowserTabTitle(isLogout ? "Log out" : "Log in");

    useEffect(() => {
        if (loggedIn) {
            ShowLoginDialog(false);
        }
    }, [loggedIn]);

    const [result, setResult] = React.useState<IInformEditorResult | undefined>(
        undefined
    );
    useEffect(() => {
        setResult(user?.informEditorResult);
    }, [user?.informEditorResult]);

    if (isLogout) {
        return (
            <CloseableDialog
                onClose={() => {
                    history.push("/");
                }}
            >
                You have successfully logged out.
            </CloseableDialog>
        );
    } else {
        switch (result) {
            case IInformEditorResult.Success:
            case IInformEditorResult.Failure:
                return (
                    <CloseableDialog
                        onClose={() => {
                            history.push("/my-books");
                        }}
                    >
                        {result === IInformEditorResult.Success
                            ? "You successfully logged in! You can now return to Bloom and upload your book."
                            : 'Login for Bloom Desktop App failed. Make sure that your browser\'s site settings for BloomLibrary.org allow "Network Access" which is a scary way of saying that we can send a message to your Bloom Desktop app'}
                    </CloseableDialog>
                );
            default:
                return loggedIn ? (
                    <Dialog open={true}>
                        <DialogContent>Logging in...</DialogContent>
                    </Dialog>
                ) : (
                    <React.Fragment />
                );
        }
    }
});

const CloseableDialog: React.FunctionComponent<{ onClose: () => void }> = (
    props
) => {
    const l10n = useIntl();

    function close() {
        props.onClose();
    }

    return (
        <Dialog open={true} onClose={close}>
            <DialogContent>{props.children}</DialogContent>
            <DialogActions>
                <Button onClick={close} color="primary">
                    {l10n.formatMessage({
                        id: "common.close",
                        defaultMessage: "Close",
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
