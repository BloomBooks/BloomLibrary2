import { Book, createBookFromParseServerData } from "../model/Book";
import { axios } from "@use-hooks/axios";
import { stringify } from "querystring";
const FileSaver = require("file-saver");

export async function giveFreeLearningCsv() {
    const rawbooks = await getHarvestedBooks();
    let books = rawbooks.map((b) => createBookFromParseServerData(b));
    // they only want open licensed books
    books = books.filter((b) => b.license.toLowerCase().startsWith("cc-"));

    const haveAlreadyOutputThisBookInThisLanguage = new Set<string>();
    const csv = books
        .map((b) =>
            // for each language in the book
            b.languages
                .map((l) => {
                    const key = b.phashOfFirstContentImage + l.isoCode;
                    // Many books will have the same English content, so we only output
                    // if this is the first time we've output this book in this language.
                    // This means we could lose some legitimately unique books, e.g. if
                    // there were two different Spanish translations, we're only going to emit
                    // the first one.
                    if (!haveAlreadyOutputThisBookInThisLanguage.has(key)) {
                        haveAlreadyOutputThisBookInThisLanguage.add(key);
                        //output a line pointing to this book in this language
                        return oneLine(b, l.isoCode);
                    }
                    return null;
                })
                .join("\n")
        )
        .join("\n");
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
    });
    FileSaver.saveAs(blob, "bloom-for-freelearning-io.csv");
}
function oneLine(book: any, isoCode: string): string {
    const fieldArray = fields(book, isoCode);
    if (fieldArray.length > 0) {
        return (
            fieldArray
                //.filter(f => f)
                .map((f) => csvEncode(f || ""))
                .join(",")
        );
    } else return "";
}
function fields(book: Book, isoCode: string): Array<string | undefined> {
    try {
        return [
            book.title.trim(), // dc:title
            `https://api.bloomlibrary.org/v1/fs/harvest/${book.id}/thumbnails/thumbnail-256.png?version=${book.updatedAt}`,
            book.summary || "", // description
            book.languages[0]?.isoCode || "", // dc:language  <-- just the first one
            book.publisher || "",
            book.license || "Unknown License",
            `https://bloomlibrary.org/readBook/${book.id}?bookLang=${isoCode}`,
        ];
    } catch (error) {
        console.error(error);
        console.log(`previous error on ${book.title}`);
        return [];
    }
}
function getHarvestedBooks(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) =>
        axios
            .get(
                "https://bloom-parse-server-production.azurewebsites.net/parse/classes/books",
                {
                    headers: {
                        "X-Parse-Application-Id":
                            "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
                    },
                    params: {
                        limit: 500,
                        where: {
                            harvestState: "Done",
                            inCirculation: { $in: [true, null] },
                            bookshelves: {
                                $regex: "COVID-19",
                            },
                        },
                        include: "langPointers",
                    },
                }
            )
            .then((result) => {
                resolve(result.data.results);
            })
            .catch((err) => {
                reject(err);
            })
    );
}

function csvEncode(incomingValue: string): string {
    let value = incomingValue || "";
    let needsQuotes = false;
    needsQuotes = value.indexOf(",") > -1;

    // mac,linux, windows all have an \r, so that's
    // enough, even though windows also has \n.
    needsQuotes = needsQuotes || value.indexOf("\r") > -1;

    // the rfc spec seems astonishingly inconsistent on the question of
    // whether quotes should be escaped if the entire field is not surrounded in quotes

    value = value.replace(/"/g, '""');

    // replace line breaks with space
    value = value.replace(/[\r\n]+/gm, "");

    // now remove extra spaces that might have caused
    value = value.replace(/\s\s/gm, "");

    if (needsQuotes) {
        // If double-quotes are used to enclose fields, then a double-quote
        // appearing inside a field must be escaped by preceding it with
        //  another double quote.
        //value = value.replace(/"/g, '""');
        return '"' + value + '"';
    }
    return value;
}
