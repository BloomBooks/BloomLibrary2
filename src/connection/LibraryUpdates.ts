import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";

export function updateBook(bookId: string, params: object): void {
    if (!bookId || !params) {
        return;
    }

    const headers = getConnection().headers;

    // Without this, the code assumes the update comes from an upload from BloomDesktop
    // and certain unwanted changes would be made to the book record
    Object.assign(params, { updateSource: "libraryUserControl" });

    axios
        .put(`${getConnection().url}classes/books/${bookId}`, params, {
            headers,
        })
        .catch((error) => {
            alert(error);
        });
}
