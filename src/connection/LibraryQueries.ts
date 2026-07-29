import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";
import {
    bookDetailFields,
    gridBookKeys,
    gridBookIncludeFields,
} from "./LibraryQueryHooks";
import { getBloomApiUrl } from "./ApiConnection";

// Get basic information about a number of books for the grid page
export async function retrieveBookData(
    query: object,
    sortOrder: string,
    skipCount: number,
    limitCount: number,
    keysToGet?: string
) {
    // Use POST with _method:"GET" so the (potentially long) query travels in the request body
    // rather than the URL. A real GET puts the whole where-clause + keys + include in the query
    // string; the non-moderator grid filter (an $or with extra conditions) made that URL long
    // enough to be rejected at the network edge before reaching parse-server -- the browser just
    // sees "Failed to fetch", so the grid showed "No data" even though the query was valid and the
    // (POST-based) count query returned a count. The count query already uses this trick; see the
    // note in makeBookQueryAxiosParams (LibraryQueryHooks). BL-16563.
    return axios.post(
        `${getConnection().url}classes/books`,
        {
            _method: "GET",
            ...query, // this is first so that the order that was part of the original query (and anything else) can be overridden by the user using the grid
            count: 1, // causes it to return the count
            order: sortOrder,
            skip: skipCount,
            limit: limitCount,
            keys: keysToGet ?? gridBookKeys,
            // fluff up fields that reference other tables
            include: gridBookIncludeFields,
        },
        {
            headers: getConnection().headers,
        }
    );
}

// Get statistics for a number of books for the grid page
export async function retrieveBookStats(
    query: object,
    sortOrder: string,
    skipCount: number,
    limitCount: number
) {
    return axios.post(`${getBloomApiUrl()}/stats/reading/per-book`, {
        filter: {
            parseDBQuery: {
                url: `${getConnection().url}classes/books`,
                method: "GET",
                options: {
                    headers: getConnection().headers,
                    params: {
                        order: sortOrder,
                        skip: skipCount,
                        limit: limitCount,
                        keys: "objectId,bookInstanceId",
                        ...query,
                    },
                },
            },
        },
    });
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
