import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";
import { bookDetailFields } from "./LibraryQueryHooks";

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
            "X-Parse-Session-Token": currentSession,
        });
    }

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

// Get the current information about one book.
// Not sure this is the right place for this. But it's used in an update operation,
// and it's definitely not a hook, so it seemed best to keep the parse server
// direct operations in just two places.
export async function retrieveCurrentBookData(bookId: string) {
    const headers = getConnection().headers;
    const result = await axios.get(
        `${getConnection().url}classes/books/${bookId}`,
        {
            headers,
            params: { keys: bookDetailFields },
        }
    );

    return result.data;
}
