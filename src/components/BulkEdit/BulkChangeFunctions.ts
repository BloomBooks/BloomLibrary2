import { IFilter } from "../../IFilter";
import { getConnection } from "../../connection/ParseServerConnection";
import { axios } from "@use-hooks/axios";
import { constructParseBookQuery } from "../../connection/LibraryQueryHooks";

export async function ChangeColumnValueForAllBooksInFilter(
    filter: IFilter,
    newValue: string,
    columnName: string,
    refresh: () => void
) {
    const finalParams = constructParseBookQuery({}, filter);
    const headers = getConnection().headers;
    const books = await axios.get(`${getConnection().url}classes/books`, {
        headers,

        params: { keys: "objectId,title", ...finalParams }
    });
    const putData: any = {};
    putData.updateSource = "libraryUserControl";
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
