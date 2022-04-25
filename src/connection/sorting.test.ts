import { BookOrderingScheme } from "../model/ContentInterfaces";
import {
    getTitleParts,
    IBookInfoForSorting,
    doExpensiveClientSideSortingIfNeeded,
    getBookSortKey,
} from "./sorting";

const titles = [
    "foo",
    "-1a- foo",
    "(3-5) foo",
    "- 1 - foo",
    "002 foo",
    "101. foo",
];

test.each(titles)("regex that divides sections", (title) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numberPart, mainPart] = getTitleParts(title);
    expect(mainPart).toBe("foo");
});

const titlesForKeys = ["foo", "002 foo", "- 3b - foo"];
test.each(titlesForKeys)("titlesForKeys", (title) => {
    expect(getBookSortKey(title, BookOrderingScheme.TitleAlphabetical)).toBe(
        title
    );
    expect(
        getBookSortKey(title, BookOrderingScheme.TitleAlphaIgnoringNumbers)
    ).toBe("foo");
});

it("sorts books with leading numbers correctly", () => {
    const titles = ["77 bb", "cc", "- 99 - aa"];
    const books: IBookInfoForSorting[] = titles.map((t) => {
        return {
            title: t,
            allTitles: t,
        };
    });
    const sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphaIgnoringNumbers
    ) as any[];
    expect(sorted[0].title).toBe("- 99 - aa");
    expect(sorted[1].title).toBe("77 bb");
    expect(sorted[2].title).toBe("cc");
});

// a and b are special in the regex because of things like "3a. foo". Make sure that doesn't mess up "a nice boy"
it("sorts books with leading a & b correctly", () => {
    const titles = ["nice boy", "a nice boy"];
    const books: IBookInfoForSorting[] = titles.map((t) => {
        return {
            title: t,
            allTitles: t,
        };
    });
    const sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphaIgnoringNumbers
    ) as any[];
    expect(sorted[0].title).toBe("a nice boy");
});

it("sorts as if leading zeros are not there", () => {
    // expect(
    //     getBookSortKey("002 foo", BookOrderingScheme.TitleAlphabetical)
    // ).toBe("2 foo");

    const titles = ["3 foo", "002 foo"];
    const books: IBookInfoForSorting[] = titles.map((t) => {
        return {
            title: t,
            allTitles: t,
        };
    });
    const sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphabetical
    ) as any[];
    expect(sorted[0].title).toBe("002 foo");
});

it("sorts using locale rules", () => {
    const titles = ["ÆA", "AA"];
    const books: IBookInfoForSorting[] = titles.map((t) => {
        return {
            title: t,
            allTitles: "",
        };
    });
    let sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphabetical,
        "en"
    ) as any[];
    expect(sorted[0].title).toBe("AA");
    sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphabetical,
        "da"
    ) as any[]; // English sorts Æ as "AE", but Danish does not and puts it before "A"
    expect(sorted[0].title).toBe("ÆA");
});

it("sorts using the title from locale if available", () => {
    const books = [
        { title: "1", allTitles: '{"en":"a", "da":"z"}' },
        { title: "2", allTitles: '{"en":"z", "da":"a"}' },
    ];
    let sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphabetical,
        "en"
    ) as any[];
    expect(sorted[0].title).toBe("1");
    sorted = doExpensiveClientSideSortingIfNeeded(
        books,
        BookOrderingScheme.TitleAlphabetical,
        "da"
    ) as any[];
    expect(sorted[0].title).toBe("2");
});
