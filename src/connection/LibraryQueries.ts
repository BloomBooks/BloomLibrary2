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
    return axios.get(`${getConnection().url}classes/books`, {
        headers: getConnection().headers,
        params: {
            count: 1, // causes it to return the count
            order: sortOrder,
            skip: skipCount,
            limit: limitCount,
            keys: keysToGet ?? gridBookKeys,
            // fluff up fields that reference other tables
            include: gridBookIncludeFields,
            ...query,
        },
    });
}

// Get statistics for a number of books for the grid page
export async function retrieveBookStats(
    query: object,
    sortOrder: string,
    skipCount: number,
    limitCount: number
) {
    return axios.post(`${getBloomApiUrl()}/v1/stats/reading/per-book`, {
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
