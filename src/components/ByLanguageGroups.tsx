import React, { useContext, useEffect, useState, useMemo } from "react";
import { IFilter } from "FilterTypes";
import { CachedTablesContext } from "../model/CacheProvider";
import {
    getDisplayNamesForLanguage,
    kTagForNoLanguage,
} from "../model/Language";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookGroup } from "./BookGroup";
import {
    bookHasFeatureInLanguage,
    featureIsLanguageDependent,
} from "./FeatureHelper";
import { BookOrderingScheme, ICollection } from "../model/ContentInterfaces";
import { doExpensiveClientSideSortingIfNeeded } from "../connection/sorting";
import { DefaultBookComparisonKeyIgnoringLanguages } from "../model/DuplicateBookFilter";

/* ----------------------------------------------------------------------------------------------------------------
*   Future Enhancement
*   Currently this is what we do
*   1) query all books
*   2) make a group for each language, copying the books
*   3) If we're doing client-side sorting, then sort all the books within each group
*
*   On pages like https://bloomlibrary.org/bible/ims-motionbook-templates, this is pretty expensive (about 5 seconds of script time on a fast desktop with empty cache).
*   Note that on fast desktop, I was not able to measure a significant difference between client-side sorting and no client-side sorting. In other words,
*   what is expensive is retrieving all the books, not the actual client-side sorting.
*
*   Alternatively, we could
*       1) query for a list of all languages that match the query
*       2) create lazy UI groups for each language
*       3) as needed, do the query+sort for each language
*
*   This might give a more responsive page, and would work in the future when we don't have to do client-side
*   sorting whereas the current approach will need to be re-organized.
*
*   Possibly, we might be able to retrieve less fields initially, for sorting purposes, then retrieve more as needed?
---------------------------------------------------------------------------------------------------------------- */

export const ByLanguageGroups: React.FunctionComponent<{
    titlePrefix: string;
    collection: ICollection;
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void;
    // Sometimes it's nice to drop English, in particular.
    excludeLanguages?: string[];
}> = (props) => {
    const {
        waiting,
        languagesWithTheseBooks,
        rows,
    } = useGetLanguagesWithTheseBooks(
        props.collection,
        props.reportBooksAndLanguages,
        props.excludeLanguages
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
                        contextLangTag={l.isoCode}
                        rows={999}
                    />
                );
            })}
        </React.Fragment>
    );
};

export function useGetLanguagesWithTheseBooks(
    collection: ICollection,
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void,
    excludeLanguages?: string[]
) {
    const filter: IFilter = collection.filter!;
    const searchResults = useSearchBooks(
        {
            include: "langPointers",
            limit: 1000000, // we want them all!
        },
        filter
        // NO! We don't want to sort on this top level.
        // We need to wait  until we have divided into language groups since each group will have its own title language.
        // collection.orderingScheme
    );
    // The combination of useRef and useEffect allows us to run the search once
    //    const rows = useRef<Map<string, { phash: string; book: IBasicBookInfo }>>(
    const [langTagToBooks, setLangTagToBooks] = useState(
        new Map<string, IBasicBookInfo[]>()
    );
    const arbitraryMaxLangsPerBook = 20;
    const waiting = searchResults.waiting;
    const needLangCheck =
        filter.feature && featureIsLanguageDependent(filter.feature);
    useEffect(() => {
        if (!waiting) {
            const mapOfLangToBookArray = new Map<string, IBasicBookInfo[]>();
            // for b in books
            // for langIndex = 1... arbitraryMaxLangsPerBook
            // lang = book.langs[langIndex]
            // if x[lang][b.comparisonKey] is missing, add x[lang][b.phash].
            // So the first book (in each set with the same comparisonKey) that has a particular language wins.
            // eslint-disable-next-line no-loop-func
            searchResults.books.forEach((book) => {
                let isBookAdded = false;
                const key = DefaultBookComparisonKeyIgnoringLanguages(book);
                const addBookToLang = (langCode: string) => {
                    isBookAdded = true;
                    if (!mapOfLangToBookArray.get(langCode)) {
                        mapOfLangToBookArray.set(langCode, []);
                    }
                    const booksInLang = mapOfLangToBookArray.get(langCode)!;
                    if (
                        key === undefined || // if we can't come up with a key, just add this book to the row
                        !booksInLang.find(
                            // do we already have a similar book for this row?
                            (book) =>
                                key ===
                                DefaultBookComparisonKeyIgnoringLanguages(book)
                        )
                    ) {
                        // shallow copy this so that it's easier to debug issues related to the sortKey we may add to each version of the book depending on the language of the row (if the selected ordering scheme sorts by title).
                        booksInLang.push(Object.assign({}, book));
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
                        if (needLangCheck) {
                            if (
                                !bookHasFeatureInLanguage(
                                    book.features,
                                    filter.feature!,
                                    langCode
                                )
                            ) {
                                continue; // don't want this book in this language list.
                            }
                        }
                        addBookToLang(langCode);
                    }
                }
                if (!isBookAdded) {
                    // This handles two very distinct use cases.
                    //
                    // 1. The book has no language at all. This is what we refer to in the UI as a "Picture Book (no text)".
                    //    In a context where we are listing out the languages (by-language-card/by-language-group),
                    //    this will get its own "language" card/group. The query logic knows how to count and display these.
                    if (!book.languages || book.languages.length === 0)
                        addBookToLang(kTagForNoLanguage);
                    // 2. The book has one or more languages, but none of those match the language-specific feature
                    //    we are displaying.
                    //
                    //    Book may have been uploaded without user setting the collection language for sign language.
                    //    (Note: Not really the case anymore. Uploading as a sign language book requires the SL language code to be set,
                    //    in both Bloom editor and in BulkUpload. However, still could be possible for the SL feature to be manually added
                    //    after the fact, and if you don't specify the lang code (and the Staff Panel doesn't let you...),
                    //    that'd lead to this case. [JS])
                    //    We still want it to show up somewhere in the sign language collection page.
                    //    We don't know how this can happen for any feature other than sign language, but
                    //    there are a few cases where it does, so we decided to allow it for all of them
                    //    so at least every book with the feature gets listed somehow.
                    //
                    //    When working on this Oct 2023, I (AP) discovered there are many (43) talking books
                    //    with a mismatch of language feature tags. Some are simply missing the language tag
                    //    for some of the languages in the book. For example, a book with English audio/text,
                    //    Tok Pisin audio/text, and Hakö text was only tagged as having Hakö though the feature
                    //    array was correctly set as talkingBook, talkingBook:en, talkingBook:tpi.
                    //
                    //    Note, this was originally implemented with an "Unknown" language group at the end,
                    //    but that didn't play well with the by-language-card layout/logic. Specifically, there
                    //    is no (reasonable) way for the query logic to count or query for this special case directly.
                    //    So now we just add it to *some* language group.
                    else
                        addBookToLang(
                            book.lang1Tag || book.languages[0].isoCode
                        );
                }
            });
            sortBooksWithinEachLanguageRow(
                mapOfLangToBookArray,
                collection.orderingScheme
            );
            setLangTagToBooks(mapOfLangToBookArray);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Including this:
        //   searchResults.books,
        // leads to an infinite loop that I haven't been able to figure out
        // You get it by typing "covid" into search, which then redirect to this page.
        // We can get away without it because the books.length will change when the query comes back
        searchResults.books.length,
        waiting,
    ]);
    const langCount = langTagToBooks.size;
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
                if (excludeLanguages) {
                    return !excludeLanguages.includes(l.isoCode);
                } else return true;
            })
            .sort((x, y) =>
                getDisplayNamesForLanguage(x).combined.localeCompare(
                    getDisplayNamesForLanguage(y).combined
                )
            );
        result.push({
            name: "", // Doesn't matter; it won't show up anywhere. Language.ts has code to get the right label.
            isoCode: kTagForNoLanguage,
            usageCount: 0,
            objectId: "",
        });
        return result;
    }, [languagesByBookCount, excludeLanguages]);
    return {
        waiting,
        languagesWithTheseBooks: useMemo(
            () =>
                languages.filter((l) => {
                    //const books = langTagToBooks.get(l.isoCode);
                    // if (books && books.length > 0) {
                    //     console.log(
                    //         `language ${l.isoCode} has ${books.length} books`
                    //     );
                    //     console.log(books.map((b) => b.objectId).join(", "));
                    // }
                    return (
                        langTagToBooks.get(l.isoCode) &&
                        langTagToBooks.get(l.isoCode)!.length > 0
                    );
                }),
            [languages, langTagToBooks]
        ),
        rows: langTagToBooks,
    };
}

function sortBooksWithinEachLanguageRow(
    rows: Map<string, IBasicBookInfo[]>,
    orderingScheme?: BookOrderingScheme
) {
    rows.forEach((books: IBasicBookInfo[], languageId: string) => {
        doExpensiveClientSideSortingIfNeeded(books, orderingScheme, languageId);
    });
}
