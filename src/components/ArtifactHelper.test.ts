import { getBookNameFromUrl } from "./BookDetail/ArtifactHelper";

it("replaces parentheses", () => {
    expect(getBookNameFromUrl("abcde%2fA (nice) book%2findex.htm")).toBe(
        "A  nice  book"
    );
});

it("removes outer quotes and periods", () => {
    expect(getBookNameFromUrl('abcde%2f "...whatever.)."%2findex.htm')).toBe(
        "whatever"
    );
});

it("reaplces nbsp", () => {
    expect(getBookNameFromUrl("abcde%2fA nbsp\u00a0was here%2findex.htm")).toBe(
        "A nbsp was here"
    );
});
