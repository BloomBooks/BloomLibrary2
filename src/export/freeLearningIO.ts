import { Book } from "../model/Book";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { getArtifactUrl } from "../components/BookDetail/ArtifactHelper";
import { getBloomApiUrl } from "../connection/ApiConnection";
import { getBookRepository } from "../data-layer";
import { IFilter } from "FilterTypes";
import FileSaver from "file-saver";

export async function giveFreeLearningCsv() {
    let books = await getFreeLearningBooks(); // Harvested, In Circulation, tag:FreeLearningIO
    // they only want open licensed books
    console.log(
        `Before filtering for license, there are ${books.length} books `
    );
    // they only accept open licensed books
    books = books.filter((b) => b.license.toLowerCase().startsWith("cc-"));
    //books = books.filter((b) => b.phashOfFirstContentImage === "");
    console.log(
        `After filtering for license, there are ${books.length} books for FreeLearningIO`
    );

    const haveAlreadyOutputThisBookInThisLanguage = new Set<string>();
    let booksWithEmptyLanguagesField = 0;
    let booksWithMissingPhash = 0;

    const lines = books
        .map((b) => {
            if (b.languages.length === 0) {
                console.error(`Languages empty: ${b.title}`);
                ++booksWithEmptyLanguagesField;
                return null;
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
                            `Read Online artifact is hidden: ${b.title}`
                        );
                        return null;
                    }

                    haveAlreadyOutputThisBookInThisLanguage.add(key);
                    //output a line pointing to this book in this language
                    return oneLine(b, l.isoCode);
                })
                .filter(
                    (bookAndLanguageLine) =>
                        bookAndLanguageLine && bookAndLanguageLine.length > 1
                )
                .join("\n");
        })
        .filter(
            (allLinesOfOneBook) =>
                allLinesOfOneBook && allLinesOfOneBook.length > 1
        );

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
        return fieldArray.map((f) => csvEncode(f || "")).join(",");
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
    resourceURL: Link to book on partner platform(link to “read mode”, not book details)
    epubURL (not in original spec, but requested later)
    */

        const valueForEpubLine = book.artifactsToOfferToUsers.epub?.decision
            ? getArtifactUrl(book, ArtifactType.epub)
            : "";

        return [
            title.trim(),
            `${getBloomApiUrl()}/fs/harvest/${
                book.id
            }/thumbnails/thumbnail-256.png?version=${book.updatedAt}`,
            book.summary || "", // description
            isoCode || "", // dc:language
            book.getBestLevel() || "", // book.getTagValue("computedLevel") || "", //
            book.uploadDate?.toISOString() || "",
            book.publisher || "",
            book.license.toUpperCase() + "-4.0", // SPDX requires this
            `https://bloomlibrary.org/readBook/${book.id}?bookLang=${isoCode}`,
            valueForEpubLine,
        ];
    } catch (error) {
        console.error(error);
        console.log(`previous error on ${book.title}`);
        return [];
    }
}
async function getFreeLearningBooks(): Promise<Book[]> {
    // Was a raw Parse query against a hardcoded production server:
    //   where: { harvestState: "Done", inCirculation: { $in: [true, null] }, tags: { $all: ["system:FreeLearningIO"] } }
    //   include: "langPointers", limit: 1000000
    // "harvestState:Done" is expressed via the search-facet syntax both
    // repository implementations recognize (see splitString()/facets in
    // src/connection/BookQueryBuilder.ts and the matching switch case in
    // SupabaseBookQueryBuilder.ts); IFilter has no dedicated harvestState field.
    // otherTags carries the single required tag (equivalent to $all with one
    // value). inCirculation is left unset, which both repositories default to
    // BooleanOptions.Yes (in_circulation === true) -- see note in the C1 report
    // about why this isn't a perfect match for the old $in:[true, null].
    const filter: IFilter = {
        otherTags: "system:FreeLearningIO",
        search: "harvestState:Done",
    };

    const result = await getBookRepository().searchBooks({
        filter,
        // Number.MAX_SAFE_INTEGER is the established "fetch everything, don't
        // paginate" idiom elsewhere in this codebase (e.g. BulkChangeFunctions.ts),
        // replacing the raw call's limit: 1000000.
        pagination: { limit: Number.MAX_SAFE_INTEGER, skip: 0 },
    });
    return result.books;
}

function csvEncode(incomingValue: string): string {
    let value = incomingValue || "";
    let needsQuotes = value.indexOf(",") > -1;

    // replace line breaks with space
    value = value.replace(/[\r\n]+/gm, " ");

    // now remove extra spaces that might have caused
    value = value.replace(/\s[\s]+/gm, " ");

    // the rfc spec seems astonishingly inconsistent on the question of
    // whether quotes should be escaped if the entire field is not surrounded in quotes
    if (value.indexOf('"') > -1) {
        value = value.replace(/"/g, '""');
        needsQuotes = true;
    }
    if (needsQuotes) {
        return '"' + value + '"';
    }
    return value.trim();
}

// though we normally don't like to export defaults, this is required for lazy module loading (code splitting)
export default giveFreeLearningCsv;
