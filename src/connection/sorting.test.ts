import { BookOrderingScheme } from "../model/ContentInterfaces";
import {
    getTitleParts,
    IBookInfoForSorting,
    doExpensiveClientSideSortingIfNeeded,
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

it("handles multiple hyphens correctly", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numberPart, mainPart] = getTitleParts("- 1 - Letters from a - g");
    expect(mainPart).toBe("Letters from a - g");
});

test.each(titles)("regex that divides sections", (title) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [numberPart, mainPart] = getTitleParts(title);
    expect(mainPart).toBe("foo");
});

it("sorts books with leading numbers correctly", () => {
    const titles = ["77 cc", "aa", "- 99 - bb"];
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
    expect(sorted[0].title).toBe("aa");
    expect(sorted[1].title).toBe("- 99 - bb");
    expect(sorted[2].title).toBe("77 cc");
});

// a and b are special in the regex because of things like "3a. foo". Make sure that doesn't mess up "a nice boy"
it("sorts books with leading a & b correctly", () => {
    const titles = ["good boy", "a nice boy"];
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
    const titles = ["3 foo", "004 bar"];
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
    expect(sorted[0].title).toBe("3 foo");
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
