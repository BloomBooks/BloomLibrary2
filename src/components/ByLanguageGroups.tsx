import React, { useContext, useEffect, useState, useMemo } from "react";
import { IFilter } from "../IFilter";
import { CachedTablesContext } from "../model/CacheProvider";
import { getDisplayNamesForLanguage } from "../model/Language";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookGroup } from "./BookGroup";
import {
    bookHasFeatureInLanguage,
    featureIsLanguageDependent,
} from "./FeatureHelper";
import { useIntl } from "react-intl";
import { ICollection } from "../model/ContentInterfaces";

export const ByLanguageGroups: React.FunctionComponent<{
    titlePrefix: string;
    collection: ICollection;
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void;
    rowsPerLanguage?: number;
    // Sometimes it's nice to drop English, in particular.
    excludeLanguages?: string[];
}> = (props) => {
    const filter: IFilter = props.collection.filter!;
    const searchResults = useSearchBooks(
        {
            include: "langPointers",
            limit: 10000, // we want them all! If we get more than 10000 books in a single filter we may need to redesign, though.
        },
        filter
    );
    const l10n = useIntl();
    const unknown = l10n.formatMessage({
        id: "language.unknown",
        defaultMessage: "Unknown",
    });
    // The combination of useRef and useEffect allows us to run the search once
    //    const rows = useRef<Map<string, { phash: string; book: IBasicBookInfo }>>(
    const [rows, setRows] = useState(new Map<string, IBasicBookInfo[]>());
    const arbitraryMaxLangsPerBook = 20;
    const reportBooksAndLanguages = props.reportBooksAndLanguages; // to avoid useEffect depending on props.
    const waiting = searchResults.waiting;
    const needLangCheck =
        filter.feature && featureIsLanguageDependent(filter.feature);
    useEffect(() => {
        if (!waiting) {
            const newRows = new Map<string, IBasicBookInfo[]>();
            // for b in books
            // for langIndex = 1... arbitraryMaxLangsPerBook
            // lang = book.langs[langIndex]
            // if x[lang][b.comparisonKey] is missing, add x[lang][b.phash].
            // So the first book (in each set with the same comparisonKey) that has a particular language wins.
            // eslint-disable-next-line no-loop-func
            searchResults.books.forEach((book) => {
                let foundOneLanguage = false;
                const key = ComparisonKey(book);
                const addBookToLang = (langCode: string) => {
                    const rowForLang = newRows.get(langCode);
                    if (!rowForLang) {
                        newRows.set(langCode, [book]);
                    } else {
                        if (
                            key === undefined || // if we can't come up with a key, just add this book to the row
                            !rowForLang.find(
                                (bookAlreadyInRow) =>
                                    key === ComparisonKey(bookAlreadyInRow)
                            )
                        ) {
                            rowForLang.push(book);
                        }
                    }
                };
                for (
                    let langIndex = 0;
                    langIndex < arbitraryMaxLangsPerBook;
                    langIndex++
                ) {
                    const langCode = book.languages[langIndex]?.isoCode;
                    if (langCode) {
                        // When filtering by feature, a book only gets added to the list for a given language
                        // if it has the feature IN THAT LANGUAGE (BL-9257)
                        if (
                            needLangCheck &&
                            !bookHasFeatureInLanguage(
                                book.features,
                                filter.feature!,
                                langCode
                            )
                        ) {
                            continue; // don't want this book in this language list.
                        }
                        foundOneLanguage = true;
                        addBookToLang(langCode);
                    }
                }
                if (!foundOneLanguage) {
                    // book may have been uploaded without user setting the collection language for sign language.
                    // We still want it to show up somewhere in the sign language collection page.
                    // Since this key is only used locally in this function, it doesn't matter that it's not a valid
                    // three-letter code; in fact, that ensures it won't conflict with a real one.
                    // We don't know how this can happen for any feature other than sign language, but
                    // there are a few cases where it does, so we decided to allow it for all of them
                    // so at least every book with the feature gets listed somehow.
                    addBookToLang("unknown");
                }
            });
            setRows(newRows);
        }
    }, [
        // Including this:
        //   searchResults.books,
        // leads to an infinite loop that I haven't been able to figure out
        // You get it by typing "covid" into search, which then redirect to this page.
        // We can get away without it because the books.length will change when the query comes back
        searchResults.books.length,
        waiting,
    ]);
    const langCount = rows.size;
    const totalBookCount = searchResults.totalMatchingRecords;
    useEffect(() => {
        if (reportBooksAndLanguages && !waiting) {
            reportBooksAndLanguages(totalBookCount, langCount);
        }
    }, [totalBookCount, langCount, reportBooksAndLanguages, waiting]);
    const { languagesByBookCount } = useContext(CachedTablesContext);
    const languages = useMemo(() => {
        const result = languagesByBookCount
            .filter((l) => {
                if (props.excludeLanguages) {
                    return !props.excludeLanguages.includes(l.isoCode);
                } else return true;
            })
            .sort((x, y) =>
                getDisplayNamesForLanguage(x).combined.localeCompare(
                    getDisplayNamesForLanguage(y).combined
                )
            );
        result.push({
            name: unknown,
            isoCode: "unknown",
            usageCount: 0,
            objectId: "",
        });
        return result;
    }, [languagesByBookCount, props.excludeLanguages, unknown]);
    const languagesWithTheseBooks = useMemo(
        () => languages.filter((l) => rows.get(l.isoCode)),
        [languages, rows]
    );
    const sortedRows = useMemo(() => {
        rows.forEach((row) => {
            row.sort((a, b) =>
                a.title
                    .trimLeft()
                    .localeCompare(b.title.trimLeft(), l10n.locale, {
                        numeric: true,
                    })
            );
        });
        return rows;
    }, [rows, l10n.locale]);
    if (waiting) {
        return <React.Fragment />;
    }
    return (
        <React.Fragment>
            {languagesWithTheseBooks.map((l) => {
                const books = sortedRows.get(l.isoCode)!;
                return (
                    <BookGroup
                        key={l.isoCode}
                        title={`${props.titlePrefix} ${
                            getDisplayNamesForLanguage(l).combined
                        }`}
                        predeterminedBooks={books}
                        contextLangIso={l.isoCode}
                        rows={props.rowsPerLanguage ?? 999}
                    />
                );
            })}
        </React.Fragment>
    );
};

function ComparisonKey(book: IBasicBookInfo): string | undefined {
    const phash = book.phashOfFirstContentImage;
    if (!phash) {
        return undefined; // undefined indicates that we can't reliably do a comparison
    }
    const featureHash = HashStringArray(book.features.sort());
    return phash + book.pageCount + featureHash + book.edition;
}

// based on https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function HashStringArray(arrayOfStrings: string[]): string {
    let hash = 0;
    for (const element of arrayOfStrings) {
        for (let i = 0; i < element.length; i++) {
            const chr = element.charCodeAt(i);
            // eslint-disable-next-line no-bitwise
            hash = (hash << 5) - hash + chr;
            // eslint-disable-next-line no-bitwise
            hash |= 0; // Convert to 32bit integer
        }
    }
    // The minimal result will be "0", if the array is empty or only contains empty strings.
    return hash.toString(10);
}
