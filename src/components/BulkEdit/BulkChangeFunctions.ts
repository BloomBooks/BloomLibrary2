import { IFilter } from "../../IFilter";
import { getConnection } from "../../connection/ParseServerConnection";
import { axios } from "@use-hooks/axios";
import { constructParseBookQuery } from "../../connection/LibraryQueryHooks";
import { CachedTables } from "../../model/CacheProvider";

export async function ChangeColumnValueForAllBooksInFilter(
    filter: IFilter,
    columnName: string,
    newValue: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: {
            limit: 100000,
            keys: "objectId,title",
            ...finalParams
        }
    });
    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";
    putData[columnName] = newValue;

    const promises: Array<Promise<any>> = [];
    for (const book of books.data.results) {
        console.log(book.title);
        promises.push(
            axios.put(
                `${getConnection().url}classes/books/${book.objectId}`,
                {
                    ...putData
                },
                { headers }
            )
        );
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch(error => {
            alert(error);
        });
}

export async function AddTagAllBooksInFilter(
    filter: IFilter,
    newTag: string,
    refresh: () => void
) {
    if (!newTag.includes(":")) {
        // Provide a default prefix if none is provided.  Otherwise a "topic" prefix is
        // chosen for us.  See https://issues.bloomlibrary.org/youtrack/issue/BL-8990.
        if (newTag.startsWith("-")) {
            newTag = "-tag:" + newTag.substr(1);
        } else {
            newTag = "tag:" + newTag;
        }
    }
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: { limit: 100000, keys: "objectId,title,tags", ...finalParams }
    });
    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<any>> = [];
    let changeCount = 0;
    for (const book of books.data.results) {
        putData.tags = [...book.tags];
        // a tag that starts with "-" means that we want to remove it
        if (newTag[0] === "-") {
            const tagToRemove = newTag.substr(1, newTag.length - 1);
            putData.tags = putData.tags.filter(
                (t: string) => t !== tagToRemove
            );
        } else if (putData.tags.indexOf(newTag) < 0) {
            putData.tags.push(newTag);
        }
        if (putData.tags.length !== book.tags.length) {
            ++changeCount;
            promises.push(
                axios.put(
                    `${getConnection().url}classes/books/${book.objectId}`,
                    {
                        ...putData
                    },
                    { headers }
                )
            );
        }
    }
    console.log(`Changing tags on ${changeCount} books...`);
    Promise.all(promises)
        .then(() => refresh())
        .catch(error => {
            alert(error);
        });
}
export async function AddBookshelfToAllBooksInFilter(
    filter: IFilter,
    newBookshelf: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: {
            limit: 100000,
            keys: "objectId,title,bookshelves",
            ...finalParams
        }
    });
    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<any>> = [];
    for (const book of books.data.results) {
        //console.log(book.title);
        putData.bookshelves = book.bookshelves || [];
        if (putData.bookshelves.indexOf(newBookshelf) < 0) {
            putData.bookshelves.push(newBookshelf);
            promises.push(
                axios.put(
                    `${getConnection().url}classes/books/${book.objectId}`,
                    {
                        ...putData
                    },
                    { headers }
                )
            );
        }
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch(error => {
            alert(error);
        });
}
