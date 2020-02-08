import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";

export function updateBook(
    bookId: string,
    params: object,
    currentSession?: string
): void {
    if (!bookId || !params) {
        return;
    }

    const headers = getConnection().headers;
    // currentSession is for old BloomLibrary code. In BL2, the login
    // process includes putting a session token into the headers that getConnection() returns.
    if (currentSession) {
        Object.assign(headers, {
            "X-Parse-Session-Token": currentSession
        });
    }

    // Without this, the code assumes the update comes from an upload from BloomDesktop
    // and certain unwanted changes would be made to the book record
    Object.assign(params, { updateSource: "libraryUserControl" });

    axios.put(`${getConnection().url}classes/books/${bookId}`, params, {
        headers
    });
}
