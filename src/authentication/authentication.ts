import { logout as logoutFromParseServer } from "../connection/ParseServerConnection";
import { getFirebaseAuth } from "./firebase/firebase";

export function isLogoutMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const logOutParamValue = urlParams.get("mode") || "";
    return logOutParamValue === "logout";
}

export function logOut() {
    getFirebaseAuth()
        .then((auth) => auth().signOut())
        .then(() => logoutFromParseServer());
}
