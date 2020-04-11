import { Book, createBookFromParseServerData } from "../model/Book";
import { axios } from "@use-hooks/axios";
const FileSaver = require("file-saver");

export async function giveFreeLearningCsv() {
    const rawbooks = await getHarvestedBooks();
    let books = rawbooks.map((b) => createBookFromParseServerData(b));
    // they only want open licensed books
    console.log(
        `Before filtering for license, there are ${books.length} books `
    );
    books = books.filter((b) => b.license.toLowerCase().startsWith("cc-"));
    console.log(
        `After filtering for license, there are ${books.length} books for FreeLearningIO`
    );

    const haveAlreadyOutputThisBookInThisLanguage = new Set<string>();
    let booksWithEmptyLanguagesField = 0;
    let booksWithMissingPhash = 0;

    const lines = books
        .map((b) => {
            if (b.languages.length === 0) {
                console.log(`Languages empty: ${b.title}`);
                ++booksWithEmptyLanguagesField;
                return [];
            }
            if (!b.phashOfFirstContentImage) {
                ++booksWithMissingPhash;
            }

            return b.languages
                .map((l) => {
                    let key = "";
                    // as of April 10,2020, this phash is still missing from a lot of books, so just give those a pass
                    if (!b.phashOfFirstContentImage) {
                        // just use the book's id in place of the phash. This will mean that all langs (except English, see below)
                        // will get output.
                        key = b.id + l.isoCode;
                        // if there is no phash and there are languages other than english, skip the English because
                        // so many books have English still hanging around. This will mean less English books, but that
                        // doesn't matter for freelearning.io, I would think.
                        if (l.isoCode === "en" && b.languages.length > 0) {
                            return null;
                        }
                    } else {
                        key = b.phashOfFirstContentImage + l.isoCode;
                    }
                    // Many books will have the same English content, so we only output
                    // if this is the first time we've output this book in this language.
                    // This means we could lose some legitimately unique books, e.g. if
                    // there were two different Spanish translations, we're only going to emit
                    // the first one.
                    if (haveAlreadyOutputThisBookInThisLanguage.has(key)) {
                        console.log(
                            `Already have ${l.isoCode} for phash of ${
                                b.title
                            } (${b.phashOfFirstContentImage.substring(
                                0,
                                5
                            )}...)`
                        );
                        return null;
                    }
                    if (!b.artifactsToOfferToUsers.readOnline?.decision) {
                        console.log(
                            `ReadOnline artifact is hidden: ${b.title}`
                        );
                        return null;
                    }

                    haveAlreadyOutputThisBookInThisLanguage.add(key);
                    //output a line pointing to this book in this language
                    return oneLine(b, l.isoCode);
                })
                .filter((x) => x && x.length > 1)
                .join("\n");
        })
        .filter((y) => y && y.length > 1);

    console.log(`Exporting ${lines.length} lines`);
    const csv = lines.join("\n");
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
    });
    console.log(
        `Books without languages field: ${booksWithEmptyLanguagesField}`
    );
    console.log(`Books with missing phash: ${booksWithMissingPhash}`);
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
        let title = book.allTitles.get(isoCode);
        if (!title) {
            title = book.title;
            console.log(
                `Missing alltitle. Using ${book.title} for language ${isoCode}`
            );
        }
        /*     title : Title of the book
    coverpicture: URL to cover picture
    description: Description of the book
    language: A BCP47 compliant language tag (RFC5646)
    Level: Level between 1 – 5
    date: The publication date of the document
    publisher: Name of the publisher of the document
    rights: The license specified as an SPDX License identifier (SPDX Licenses)
    resourceURL: Link to book on partner platform(link to “read mode”, not book details)*/

        return [
            title.trim(),
            `https://api.bloomlibrary.org/v1/fs/harvest/${book.id}/thumbnails/thumbnail-256.png?version=${book.updatedAt}`,
            book.summary || "", // description
            isoCode || "", // dc:language
            book.getTagValue("computedLevel") || "", //book.getBestLevel() || "",
            book.uploadDate?.toISOString() || "",
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
                        limit: 10000,
                        where: {
                            harvestState: "Done",
                            inCirculation: { $in: [true, null] },
                            tags: { $all: ["system:FreeLearningIO"] },
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
