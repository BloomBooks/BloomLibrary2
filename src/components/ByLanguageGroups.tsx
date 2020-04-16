import React, { useContext, useEffect, useState, useMemo } from "react";
import { IFilter } from "../IFilter";
import { CachedTablesContext } from "../App";
import { getLanguageNames } from "../model/Language";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookGroup } from "./BookGroup";

export const ByLanguageGroups: React.FunctionComponent<{
    titlePrefix: string;
    filter: IFilter;
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void;
    rowsPerLanguage?: number;
}> = (props) => {
    const searchResults = useSearchBooks(
        {
            include: "langPointers",
        },
        props.filter
    );
    // The combination of useRef and useEffect allows us to run the search once
    //    const rows = useRef<Map<string, { phash: string; book: IBasicBookInfo }>>(
    const [rows, setRows] = useState(new Map<string, IBasicBookInfo[]>());
    const [totalBookCount, setTotalBookCount] = useState(0);
    const arbitraryMaxLangsPerBook = 20;
    const reportBooksAndLanguages = props.reportBooksAndLanguages; // to avoid useEffect depending on props.
    useEffect(() => {
        const newRows = new Map<string, IBasicBookInfo[]>();
        let totalCount = 0;
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
            searchResults.books.forEach((b) => {
                const l = b.languages[langIndex]?.isoCode;
                if (l) {
                    const rowForLang = newRows.get(l);
                    if (!rowForLang) {
                        newRows.set(l, [b]);
                        totalCount++;
                    } else {
                        if (
                            !rowForLang.find(
                                (y) =>
                                    y.phashOfFirstContentImage ===
                                        b.phashOfFirstContentImage ||
                                    !y.phashOfFirstContentImage
                            )
                        ) {
                            rowForLang.push(b);
                            totalCount++;
                        }
                    }
                }
            });
        }
        setRows(newRows);
        setTotalBookCount(totalCount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Including this:
        //   searchResults.books,
        // leads to an infinite loop that I haven't been able to figure out
        // You get it by typing "covid" into search, which then redirect to this page.
        // We can get away without it because the books.length will change when the query comes back
        searchResults.books.length,
        reportBooksAndLanguages,
    ]);
    const langCount = rows.size;
    useEffect(() => {
        if (reportBooksAndLanguages) {
            reportBooksAndLanguages(totalBookCount, langCount);
        }
    }, [totalBookCount, langCount, reportBooksAndLanguages]);
    const { languagesByBookCount } = useContext(CachedTablesContext);
    const languages = useMemo(
        () =>
            languagesByBookCount.sort((x, y) =>
                getLanguageNames(x).displayNameWithAutonym.localeCompare(
                    getLanguageNames(y).displayNameWithAutonym
                )
            ),
        [languagesByBookCount]
    );
    const languagesWithTheseBooks = useMemo(
        () => languages.filter((l) => rows.get(l.isoCode)),
        [languages, rows]
    );
    return (
        <React.Fragment>
            {languagesWithTheseBooks.map((l) => {
                const books = rows.get(l.isoCode)!;
                return (
                    <BookGroup
                        key={l.isoCode}
                        title={`${props.titlePrefix} ${
                            getLanguageNames(l).displayNameWithAutonym
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
