import { observable } from "mobx";
import firebase from "firebase";

// export const staticUser = observable.box<firebase.User | null>(null); // null instead of undefined to fit with the firebase sdk

// export function getCurrentUser(): firebase.User | null {
//     return staticUser;
// }
// export function setCurrentUser(user: firebase.User | null) {
//     console.assert(user === firebase.auth().currentUser);
//     staticUser = user;
// }
