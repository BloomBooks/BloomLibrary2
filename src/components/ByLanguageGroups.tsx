import React, { useContext, useEffect, useState, useMemo } from "react";
import { IFilter } from "../IFilter";
import { CachedTablesContext } from "../model/InternationalizedContent";
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

export const ByLanguageGroups: React.FunctionComponent<{
    titlePrefix: string;
    filter: IFilter;
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void;
    rowsPerLanguage?: number;
    // Sometimes it's nice to drop English, in particular.
    excludeLanguages?: string[];
}> = (props) => {
    const searchResults = useSearchBooks(
        {
            include: "langPointers",
            limit: 10000, // we want them all! If we get more than 10000 books in a single filter we may need to redesign, though.
        },
        props.filter
    );
    // The combination of useRef and useEffect allows us to run the search once
    //    const rows = useRef<Map<string, { phash: string; book: IBasicBookInfo }>>(
    const [rows, setRows] = useState(new Map<string, IBasicBookInfo[]>());
    const arbitraryMaxLangsPerBook = 20;
    const reportBooksAndLanguages = props.reportBooksAndLanguages; // to avoid useEffect depending on props.
    const waiting = searchResults.waiting;
    const needLangCheck =
        props.filter.feature &&
        featureIsLanguageDependent(props.filter.feature);
    useEffect(() => {
        if (!waiting) {
            const newRows = new Map<string, IBasicBookInfo[]>();
            // for langIndex = 1... arbitraryMaxLangsPerBook
            // for b in books
            // lang = book.langs[langIndex]
            // if x[lang][b.phash] is missing, add x[lang][b.phash]. So the first book with a lang in position langIndex wins.
            for (
                let langIndex = 0;
                langIndex < arbitraryMaxLangsPerBook;
                langIndex++
            ) {
                // eslint-disable-next-line no-loop-func
                searchResults.books.forEach((book) => {
                    const key = ComparisonKey(book);
                    const langCode = book.languages[langIndex]?.isoCode;
                    if (langCode) {
                        // When filtering by feature, a book only gets added to the list for a given language
                        // if it has the feature IN THAT LANGUAGE (BL-9257)
                        if (
                            needLangCheck &&
                            !bookHasFeatureInLanguage(
                                book.features,
                                props.filter.feature!,
                                langCode
                            )
                        ) {
                            return; // from this iteration of forEach; don't want this book.
                        }
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
                    }
                });
            }
            setRows(newRows);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Including this:
        //   searchResults.books,
        // leads to an infinite loop that I haven't been able to figure out
        // You get it by typing "covid" into search, which then redirect to this page.
        // We can get away without it because the books.length will change when the query comes back
        searchResults.books.length,
        reportBooksAndLanguages,
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
    const languages = useMemo(
        () =>
            languagesByBookCount
                .filter((l) => {
                    if (props.excludeLanguages) {
                        return !props.excludeLanguages.includes(l.isoCode);
                    } else return true;
                })
                .sort((x, y) =>
                    getDisplayNamesForLanguage(x).combined.localeCompare(
                        getDisplayNamesForLanguage(y).combined
                    )
                ),
        [languagesByBookCount, props.excludeLanguages]
    );
    const languagesWithTheseBooks = useMemo(
        () => languages.filter((l) => rows.get(l.isoCode)),
        [languages, rows]
    );
    if (waiting) {
        return <React.Fragment />;
    }
    return (
        <React.Fragment>
            {languagesWithTheseBooks.map((l) => {
                const books = rows.get(l.isoCode)!;
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
            // tslint:disable-next-line: no-bitwise
            hash = (hash << 5) - hash + chr;
            // tslint:disable-next-line: no-bitwise
            hash |= 0; // Convert to 32bit integer
        }
    }
    // The minimal result will be "0", if the array is empty or only contains empty strings.
    return hash.toString(10);
}
