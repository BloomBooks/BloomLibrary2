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

// Tracks a sessionToken we've already notified Bloom (editor) about.
//
// Why this exists:
// - In theory, `connectParseServer()` can be triggered more than once during a single browser session
//   (e.g. auth state callbacks can fire more than once, the user can reload the tab, etc.).
// - We have observed multiple posts to Bloom for a single "login-for-editor" attempt.
//   In BL-14503, Bloom's `/bloom/api/external/login` endpoint logged multiple
//   "External login successful" lines for the same attempt, and also threw when the payload
//   was missing `email`. Suppressing duplicate notifications on the Blorg side helps reduce
//   noise and was part of an attempt to bolster error handling.
//
// Behavior:
// - Set before sending to suppress duplicates while the POST is in-flight.
// - Cleared on failure. I don't think this much matter, but it seems cleaner.
let notifiedSessionToken: string | undefined;

export function informEditorOfSuccessfulLogin(
    userData: any,
    // The Google/Firebase profile picture (user.photoURL), or null/undefined when there is
    // none (e.g. an email-password login). Kept as a plain param so this file stays free of
    // any firebase import (see the code-split note in firebase.ts).
    photoUrl?: string | null
) {
    if (notifiedSessionToken === userData.sessionToken) {
        return;
    }

    // Deploy-order independence (CRITICAL): `photoUrl` is a NEW, purely additive and optional
    // field on this browser -> Bloom-desktop callback. blorg and Bloom deploy independently and
    // in an unpredictable order, so:
    //   - An older Bloom simply ignores the extra field (its JSON parse is tolerant).
    //   - We must never rename or remove the existing fields.
    //   - We send `null` (never "" and never a fabricated value) when there is no picture.
    const postData = {
        sessionToken: userData.sessionToken,
        email: userData.email,
        userId: userData.objectId,
        photoUrl: photoUrl ?? null,
    };

    notifiedSessionToken = userData.sessionToken;

    axios
        .post(`${getEditorApiUrl()}login`, postData)
        .then(() => {
            // Update the live logged-in user that the waiting screen observes
            // (LoginForEditor via useGetLoggedInUser), not a throwaway snapshot.
            if (LoggedInUser.current) {
                LoggedInUser.current.informEditorResult =
                    IInformEditorResult.Success;
            }
        })
        .catch((err) => {
            if (LoggedInUser.current) {
                LoggedInUser.current.informEditorResult =
                    IInformEditorResult.Failure;
            }
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
