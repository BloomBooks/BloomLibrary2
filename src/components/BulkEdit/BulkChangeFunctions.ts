import { IFilter } from "../../IFilter";
import { getConnection } from "../../connection/ParseServerConnection";
import { axios } from "@use-hooks/axios";
import { AxiosResponse } from "axios";
import {
    assertAllParseRecordsReturned,
    constructParseBookQuery,
    IParseResponseDataWithCount,
    IParseCommonFields,
} from "../../connection/LibraryQueryHooks";
import { CachedTables } from "../../model/CacheProvider";

export async function ChangeColumnValueForAllBooksInFilter(
    filter: IFilter,
    columnName: string,
    newValue: string | boolean,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: {
            limit: Number.MAX_SAFE_INTEGER,
            count: 1,
            keys: "objectId,title",
            ...finalParams,
        },
    });

    assertAllParseRecordsReturned(books);

    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";
    putData[columnName] = newValue;

    const promises: Array<Promise<unknown>> = [];
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

        params: {
            limit: Number.MAX_SAFE_INTEGER,
            count: 1,
            keys: "objectId,title,tags",
            ...finalParams,
        },
    });

    assertAllParseRecordsReturned(books);

    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<unknown>> = [];
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
                        ...putData,
                    },
                    { headers }
                )
            );
        }
    }
    console.log(`Changing tags on ${changeCount} books...`);
    Promise.all(promises)
        .then(() => refresh())
        .catch((error) => {
            alert(error);
        });
}

export async function AddFeatureToAllBooksInFilter(
    filter: IFilter,
    newFeature: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = (await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: {
            limit: Number.MAX_SAFE_INTEGER,
            count: 1,
            keys: "objectId,title,features",
            ...finalParams,
        },
    })) as AxiosResponse<
        IParseResponseDataWithCount<
            IParseCommonFields & {
                features: string[];
            }
        >
    >;

    assertAllParseRecordsReturned(books);

    const putData: {
        updateSource: string;
        features?: string[];
    } = {
        updateSource: "bloom-library-bulk-edit",
    };

    const promises: Array<Promise<unknown>> = [];
    let changeCount = 0;
    for (const book of books.data.results) {
        putData.features = [...book.features];
        // a feature that starts with "-" means that we want to remove it
        if (newFeature[0] === "-") {
            const featureToRemove = newFeature.substr(1, newFeature.length - 1);
            putData.features = putData.features.filter(
                (f: string) => f !== featureToRemove
            );
        } else if (putData.features.indexOf(newFeature) < 0) {
            putData.features.push(newFeature);
        }
        if (putData.features.length !== book.features.length) {
            ++changeCount;
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
    console.log(`Changing features on ${changeCount} books...`);

    // ENHANCE: Or we could await Promise.all.
    // The caller (bulkEditPanel) could await this promise and then call props.refresh()
    // Instead of passing callbacks down the stack many layers.
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

        params: {
            limit: Number.MAX_SAFE_INTEGER,
            count: 1,
            keys: "objectId,title,bookshelves",
            ...finalParams,
        },
    });
    assertAllParseRecordsReturned(books);

    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<unknown>> = [];
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

export async function AddExclusiveCollectionToAllBooksInFilter(
    filter: IFilter,
    urlKey: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter, CachedTables.tags);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: {
            limit: Number.MAX_SAFE_INTEGER,
            count: 1,
            keys: "objectId,title,exclusiveCollections",
            ...finalParams,
        },
    });
    assertAllParseRecordsReturned(books);

    const putData: any = {};
    putData.updateSource = "bloom-library-bulk-edit";

    const promises: Array<Promise<unknown>> = [];
    for (const book of books.data.results) {
        //console.log(book.title);
        putData.exclusiveCollections = book.exclusiveCollections || [];
        if (urlKey[0] === "-") {
            const keyToRemove = urlKey.substring(1).toLowerCase();
            putData.exclusiveCollections = putData.exclusiveCollections.filter(
                (s: string) => s.toLowerCase() !== keyToRemove
            );
        } else if (putData.exclusiveCollections.indexOf(urlKey) < 0) {
            putData.exclusiveCollections.push(urlKey);
        }
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
