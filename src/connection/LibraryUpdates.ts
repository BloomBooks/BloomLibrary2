import { axios } from "@use-hooks/axios";
import { getConnection } from "./Connection";

export function updateBook(
    bookId: string,
    params: object,
    currentSession?: string
): void {
    if (!bookId || !params || !currentSession) return;

    const headers = getConnection().headers;
    Object.assign(headers, {
        "X-Parse-Session-Token": currentSession
    });

    // Without this, the code assumes the update comes from an upload from BloomDesktop
    // and certain unwanted changes would be made to the book record
    Object.assign(params, { updateSource: "libraryUserControl" });

    axios.put(`${getConnection().url}classes/books/${bookId}`, params, {
        headers: headers
    });
}
