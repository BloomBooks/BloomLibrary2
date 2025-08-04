import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { getBookTitleInLanguageOrUndefined } from "./Book";
import { kTagForNoLanguage } from "./Language";

// eventually we expect there to be more than one of these, and
// for Contentful to be able to specify which one to use, hence the use of the string.
export enum DuplicateBookFilter {
    PreferBooksWhereL1MatchesContextLanguage = "PreferBooksWhereL1MatchesContextLanguage",
}
export function getFilterDuplicateBookFilterFromName(
    name: string
): (
    books: IBasicBookInfo[],
    languageInFocus?: string,
    // markButDoNotRemove is used for the troubleshooting view where we display semi-transparent version
    // of the cards that would be removed
    markButDoNotRemove?: boolean
) => IBasicBookInfo[] {
    switch (name) {
        case DuplicateBookFilter.PreferBooksWhereL1MatchesContextLanguage:
            return PreferBooksWithL1MatchingFocusLanguage_DuplicateBookFilter;
        default:
            throw new Error(`Unknown filter name: ${name}`);
    }
}

// IDEA: Show the books that were uploaded with the L1 set to the language in focus.
// RULE:
//    For each group of books sharing the same phash,
//        show only those where L1 == language in focus, unless none do, in which case show them all.
// This is appropriate when we are showing a page of books based on a focus language, and
// the publisher does not want to show the same book over and over in LWC pages just because they
// chose to leave language in the translated books.
export function PreferBooksWithL1MatchingFocusLanguage_DuplicateBookFilter(
    books: IBasicBookInfo[],
    languageInFocus?: string,
    markButDoNotRemove?: boolean
): IBasicBookInfo[] {
    // use bookHashFromImages (or phash if not available) to get candidates for duplicates
    const hashToBooks = new Map<string, IBasicBookInfo[]>();
    for (const book of books) {
        let hash = book.phashOfFirstContentImage;
        if (book.bookHashFromImages) {
            hash = book.bookHashFromImages;
        }
        if (languageInFocus) {
            let titleInContextLang = getBookTitleInLanguageOrUndefined(
                book,
                languageInFocus
            );
            if (!titleInContextLang) {
                if (book.features.includes("signLanguage")) {
                    // Sign language books don't have a title in the sign language.
                    titleInContextLang = getBookTitleInLanguageOrUndefined(
                        book,
                        book.lang1Tag || "en"
                    );
                    if (!titleInContextLang) {
                        titleInContextLang = book.allTitles?.[0] ?? "";
                    }
                } else if (languageInFocus !== kTagForNoLanguage) {
                    continue; // just skip it. There are surprisingly many books that have some English but don't have the title in English. E.g. 6jFUJ8jeEv
                }
            }
            hash += (titleInContextLang ?? "").toLowerCase();
        }
        if (!hash) {
            hashToBooks.set(book.objectId, [book]); // ah well, this gets its own bin
            continue;
        }
        // add this book to the bin for this phash
        hashToBooks.set(hash, [...(hashToBooks.get(hash) || []), book]);
    }

    const booksToShow: IBasicBookInfo[] = [];
    for (const hash of hashToBooks.keys()) {
        const booksInBin = hashToBooks.get(hash)!;
        if (booksInBin.length === 1) {
            booksToShow.push(...booksInBin);
            continue;
        }
        const booksWithL1MatchingFocus = booksInBin.filter(
            (book) => book.lang1Tag === languageInFocus
        );
        if (booksWithL1MatchingFocus.length > 0)
            booksToShow.push(...booksWithL1MatchingFocus);
        else {
            // none of the books in the bin had L1 matching the focus language, but
            // showing them all is annoying, (see COVID-19:english) so we'll just show the first one
            // but mark it to show a stacked effect.
            /*          This is an experiment that seems sound in practice but I didn't find any examples where it made a difference
            so I've taken it out for now.

            // This is a brute force way to do this.
            // Sort the booksInBin by the length of their features property so that the one with the most features is first
            const a = booksInBin[0];
            // for each book in the Bin, add a property that is the number of features for the context language
            for (const book of booksInBin) {
                (book as any).numFeaturesInContextLang = book.features.filter(
                    (feature) => feature.endsWith(":" + languageInFocus)
                ).length;
            }
            booksInBin.sort(
                (a, b) =>
                    (b as any).numFeaturesInContextLang -
                    (a as any).numFeaturesInContextLang
            );
            if (
                a !== booksInBin[0] &&
                (a as any).numFeaturesInContextLang !==
                    (booksInBin[0] as any).numFeaturesInContextLang
            )
                console.log(
                    "Chose a different one to show based on features length: " +
                        getBookTitleInLanguageOrUndefined(
                            booksInBin[0],
                            languageInFocus!
                        )
                );
                */
            booksInBin[0].showStacked = true;
            booksToShow.push(booksInBin[0]);
        }

        // Enhance: we could show more books by considering different paper sizes, with different features, etc.
    }

    // for each book that is in books but not in booksToShow, mark it as a duplicate
    if (markButDoNotRemove) {
        for (const book of books) {
            if (!booksToShow.includes(book)) {
                book.wouldBeRemoved = true;
            }
        }
        return books;
    } else return booksToShow;
}

// Even though this is only used in one place, I moved this to this file just to keep similar
// semantics things together so that we don't forget about other, even older parts doing similar things.
export function DefaultBookComparisonKeyIgnoringLanguages(
    book: IBasicBookInfo
): string | undefined {
    let hash = book.bookHashFromImages;
    if (!hash) {
        hash = book.phashOfFirstContentImage;
    }
    // if we don't have a hash, we can't reliably compare the book to others
    if (!hash) {
        return undefined; // undefined indicates that we can't reliably do a comparison
    }
    const featureHash = HashStringArray(book.features.sort());
    return hash + book.pageCount + featureHash + book.edition;
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
