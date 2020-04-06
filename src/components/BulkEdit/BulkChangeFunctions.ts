import { IFilter } from "../../IFilter";
import { getConnection } from "../../connection/ParseServerConnection";
import { axios } from "@use-hooks/axios";
import { constructParseBookQuery } from "../../connection/LibraryQueryHooks";
import { CachedTables } from "../../App";

export async function ChangeColumnValueForAllBooksInFilter(
    filter: IFilter,
    newValue: string,
    columnName: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: { keys: "objectId,title", ...finalParams },
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
                    ...putData,
                },
                { headers }
            )
        );
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch((error) => {
            alert(error);
        });
}

export async function AddTagAllBooksInFilter(
    filter: IFilter,
    newTag: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: { keys: "objectId,title,tags", ...finalParams },
    });
    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<any>> = [];
    for (const book of books.data.results) {
        console.log(book.title);
        putData.tags = book.tags || [];
        if (putData.tags.indexOf(newTag) < 0) {
            putData.tags.push(newTag);
            promises.push(
                axios.put(
                    `${getConnection().url}classes/books/${book.objectId}`,
                    {
                        ...putData,
                    },
                    { headers }
                )
            );
        }
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch((error) => {
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

        params: { keys: "objectId,title,bookshelves", ...finalParams },
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
                        ...putData,
                    },
                    { headers }
                )
            );
        }
    }
    Promise.all(promises)
        .then(() => refresh())
        .catch((error) => {
            alert(error);
        });
}
