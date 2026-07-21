import { getFirebaseAuth } from "./firebase/firebase";
import { DataLayerFactory } from "../data-layer/factory/DataLayerFactory";

export function isLogoutMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const logOutParamValue = urlParams.get("mode") || "";
    return logOutParamValue === "logout";
}

export function logOut() {
    getFirebaseAuth()
        .then((auth) => auth().signOut())
        .then(() => {
            const authService = DataLayerFactory.getInstance().createAuthenticationService();
            return authService.logout();
        });
}
