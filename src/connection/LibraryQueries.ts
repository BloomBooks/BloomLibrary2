import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";
import {
    bookDetailFields,
    gridBookKeys,
    gridBookIncludeFields,
} from "./LibraryQueryHooks";

// Get all the information for all the books currently displayed in the grid, as
// filtered and sorted by query and sortOrder.
// This axios call in this method must mimic that in LibraryQueryHooks/useGetBooksForGrid
// exactly except for not setting skip and setting limit to an unreasonably large number.
// useGetBooksForGrid uses useAxios for the call to keep things simple, but we can't use
// that hook because of React's infamous Law of Hooks.
// (Actually, if we wanted to make 2 calls to useGetBooksForGrid every time, we could, once
// for a page's worth of books and once for all the books, but that's grossly inefficient
// and makes it harder to guarantee that the exported data is the absolute latest since it
// can take several seconds best case to fetch all of the book data.)
export async function retrieveAllGridBookData(
    query: object,
    sortOrder: string
) {
    const result = await axios.get(`${getConnection().url}classes/books`, {
        headers: getConnection().headers,
        params: {
            order: sortOrder,
            count: 1, // causes it to return the count
            limit: 100000000,
            keys: gridBookKeys,
            // fluff up fields that reference other tables
            include: gridBookIncludeFields,
            ...query,
        },
    });
    return result.data;
}

// Get the current information about one book.
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
