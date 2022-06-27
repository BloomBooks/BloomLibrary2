import { getBestBookTitle } from "../model/Book";
import { BookOrderingScheme } from "../model/ContentInterfaces";

// About all this:   https://issues.bloomlibrary.org/youtrack/issue/BL-11137
export interface IBookInfoForSorting {
    title: string;
    allTitles: string;
    sortKey?: string; // optional because it's empty on input but filled out output of sortBooks()
}

export function getTitleParts(s: string): string[] {
    // separate out the number prefix from the main part in ("-1a- foo", "(3-5) Spider", "- 1 - foo", "002 foo", "101. foo", "foo")
    const parts = s.match(
        // For testing this online with unit tests: https://regex101.com/r/T9zEvK/1
        // NOTE that this link has TWO kinds of tests: teh "Test String" and a set of "Unit Tests".
        // eslint-disable-next-line no-useless-escape
        /^([-,(,\[,\s]*[0-9]+(?:[\-]\s*[0-9]*)*[a,b]*(?:\s*[-,),\],\.])*)?\s*(.*)$/
    );
    // ... to the end by making their sort key start with a symbol that sorts last
    return parts ? parts.splice(1) : [s];
}

export function getBookSortKey(s: string, orderingScheme: BookOrderingScheme) {
    switch (orderingScheme) {
        case BookOrderingScheme.TitleAlphabetical:
            return s; //.replace(/^0+/, ""); // trim leading zeros so that "03" orders after "2";

        case BookOrderingScheme.TitleAlphaIgnoringNumbers:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [unused, partWithoutNumbers] = getTitleParts(s);
            return partWithoutNumbers;

        /*  At one point we experimented with pushing books that start with numbers
            to the end by making their sort key start with a symbol that sorts last

            case BookOrderingScheme.AlphabeticalPenalizeNumbers:
                const [numberPart, mainPart] = getTitleParts(s);
                return numberPart ? "zz" + numberPart + mainPart : mainPart;
        */

        default: {
            // if you are here because you saw this: note that the only schemes that should reach us are
            // ones that can't be handled on the server, in the original query. For example, if we just
            // want to sort by creation date, we should never get into this code, which is expensive.
            console.error(
                `getBookSortKey() unsupported BookOrderingScheme: ${orderingScheme.toString()}`
            );
            return s;
        }
    }
}

export function doExpensiveClientSideSortingIfNeeded(
    books: IBookInfoForSorting[], //could be IBasicBookInfo[] but that's tough on unit tests
    orderingScheme?: BookOrderingScheme,
    languageForSorting?: string
): IBookInfoForSorting[] {
    switch (orderingScheme) {
        case BookOrderingScheme.TitleAlphaIgnoringNumbers:
        case BookOrderingScheme.TitleAlphabetical:
            books.forEach((b: any) => {
                const t = getBestBookTitle(
                    b.title,
                    b.allTitles,
                    languageForSorting
                );
                b.sortKey = getBookSortKey(t, orderingScheme);
            });

            const comparator = new Intl.Collator(
                languageForSorting /* it's ok if this is missing */,
                { numeric: true }
            );
            const r = books.sort(
                (a: IBookInfoForSorting, b: IBookInfoForSorting) =>
                    comparator.compare(a.sortKey!, b.sortKey!)
            );
            return r;
        default:
            return books; // we already ordered them on the server
    }
}
