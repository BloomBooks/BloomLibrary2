import { logout as logoutFromParseServer } from "../connection/ParseServerConnection";
import { getFirebaseAuth } from "./firebase/firebase";

export function logOut() {
    getFirebaseAuth()
        .then((auth) => auth().signOut())
        .then(() => logoutFromParseServer());
}
