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
            ...query, // this is first so that the order that was part of the original query (and anything else) can be overridden by the user using the grid
            count: 1, // causes it to return the count
            order: sortOrder,
            skip: skipCount,
            limit: limitCount,
            keys: keysToGet ?? gridBookKeys,
            // fluff up fields that reference other tables
            include: gridBookIncludeFields,
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

// Get the basic information about books and users for the language-grid, country-grid,
// and uploader-grid pages.
export async function retrieveBookAndUserData() {
    return axios.get(`${getConnection().url}classes/books`, {
        headers: getConnection().headers,
        params: {
            limit: 100000, // all of them
            keys: "uploader,createdAt,show,tags",
            // fluff up fields that reference other tables
            include: "uploader",
            where: { inCirculation: true, draft: false },
        },
    });
}
