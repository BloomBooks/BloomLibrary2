import { axios } from "@use-hooks/axios";
import { IInformEditorResult, LoggedInUser } from "./connection/LoggedInUser";

function getPort() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("port") || 8089;
}

function getEditorApiUrl() {
    return `http://localhost:${getPort()}/bloom/api/external/`;
}

export function isForEditor() {
    return window.location.pathname.includes("login-for-editor");
}

// Tracks a sessionToken we've already notified Bloom about.
// It is set before sending (to suppress duplicates while in-flight)
// and cleared on failure (to allow retry).
let notifiedSessionToken: string | undefined;

export function informEditorOfSuccessfulLogin(userData: any) {
    if (notifiedSessionToken === userData.sessionToken) {
        return;
    }

    const postData = {
        sessionToken: userData.sessionToken,
        email: userData.email,
        userId: userData.objectId,
    };

    notifiedSessionToken = userData.sessionToken;

    axios
        .post(`${getEditorApiUrl()}login`, postData)
        .then(() => {
            LoggedInUser.current!.informEditorResult =
                IInformEditorResult.Success;
        })
        .catch((err) => {
            LoggedInUser.current!.informEditorResult =
                IInformEditorResult.Failure;
            // Allow a retry if something transient happened.
            notifiedSessionToken = undefined;

            console.error("Unable to inform editor of successful login.");
            console.error(err);
        });
}

export function bringEditorToFront() {
    axios.post(`${getEditorApiUrl()}bringToFront`).catch((err) => {
        console.error("Unable to tell editor to come to front.");
        console.error(err);
    });
}
