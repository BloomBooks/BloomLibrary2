import { getBookNamePartOfUrl } from "./BookDetail/ArtifactHelper";

it("finds folder from URL", () => {
    expect(
        getBookNamePartOfUrl(
            "https://s3.amazonaws.com/BloomTests/abcde%2fA  nice  book%2findex.htm"
        )
    ).toBe("A  nice  book");
});

it("extracte book name part of URL", () => {
    expect(
        getBookNamePartOfUrl(
            "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/john_thomson%40sil.org%2ffefab0ed-60b6-4c5d-9e7f-2a113106a441%2fBook+with+%23+and+%3d+n%c9%a8g%2f"
        )
    ).toBe("Book+with+%23+and+%3d+n%c9%a8g");
});
