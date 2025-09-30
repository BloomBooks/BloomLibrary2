import { axios } from "@use-hooks/axios";
import { IInformEditorResult } from "./connection/LoggedInUser";
import { DataLayerFactory } from "./data-layer/factory/DataLayerFactory";

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

export function informEditorOfSuccessfulLogin(userData: any) {
    const postData = {
        sessionToken: userData.sessionToken,
        email: userData.email,
        userId: userData.objectId,
    };
    axios
        .post(`${getEditorApiUrl()}login`, postData)
        .then(() => {
            const authService = DataLayerFactory.getInstance().createAuthenticationService();
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                (currentUser as any).informEditorResult =
                    IInformEditorResult.Success;
            }
        })
        .catch((err) => {
            const authService = DataLayerFactory.getInstance().createAuthenticationService();
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                (currentUser as any).informEditorResult =
                    IInformEditorResult.Failure;
            }

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
