import { IBasicBookInfo } from "../connection/LibraryQueryHooks";

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
    // use phash to get candidates for duplicates
    const phashToBooks = new Map<string, IBasicBookInfo[]>();
    for (const book of books) {
        if (!book.phashOfFirstContentImage) {
            phashToBooks.set(book.objectId, [book]); // ah well, this gets its own bin
            continue;
        }
        // add this book to the bin for this phash
        phashToBooks.set(book.phashOfFirstContentImage, [
            ...(phashToBooks.get(book.phashOfFirstContentImage) || []),
            book,
        ]);
    }

    const booksToShow: IBasicBookInfo[] = [];
    for (const phash of phashToBooks.keys()) {
        const booksInBin = phashToBooks.get(phash)!;
        const booksWithL1MatchingFocus = booksInBin.filter(
            (book) => book.lang1Tag === languageInFocus
        );
        if (booksWithL1MatchingFocus.length > 0)
            booksToShow.push(...booksWithL1MatchingFocus);
        else
            booksToShow.push(
                // otherwise include them all.
                ...booksInBin
            );

        // Enhance: we could show less books by considering features such as Talking book, activities, etc.

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
