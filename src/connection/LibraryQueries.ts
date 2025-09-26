import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";
import { bookDetailFields } from "./BookQueryBuilder";
import { getBloomApiUrl } from "./ApiConnection";

// Constants moved from LibraryQueryHooks (now in ParseBookRepository as private methods)
const gridBookKeys =
    "objectId,bookInstanceId," +
    "title,baseUrl,license,licenseNotes,inCirculation,draft,summary,copyright,harvestState," +
    "harvestLog,harvestStartedAt,tags,pageCount,phashOfFirstContentImage,bookHashFromImages,show,credits,country," +
    "features,internetLimits,librarianNote,uploader,langPointers,importedBookSourceUrl," +
    "downloadCount,publisher,originalPublisher,brandingProjectName,keywords,edition,rebrand,leveledReaderLevel," +
    "analytics_finishedCount,analytics_startedCount,analytics_shellDownloads";

const gridBookIncludeFields = "uploader,langPointers";

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
