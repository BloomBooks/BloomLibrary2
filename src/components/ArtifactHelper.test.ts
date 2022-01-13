import { getBookNameFromUrl } from "./BookDetail/ArtifactHelper";

it("finds folder from URL", () => {
    expect(
        getBookNameFromUrl(
            "https://s3.amazonaws.com/BloomTests/abcde%2fA  nice  book%2findex.htm"
        )
    ).toBe("A  nice  book");
});

it("decodes URL", () => {
    expect(getBookNameFromUrl("abcde%2fAn %40 was%20here%2findex.htm")).toBe(
        "An @ was here"
    );
});
