import { describe, expect, it } from "vitest";
import { Book } from "../../model/Book";
import { ArtifactType, getArtifactUrl } from "./ArtifactHelper";

// Under jsdom we are on localhost, so getBloomApiUrl() gives the vite proxy's path.
const api = "/api/v1";

function makeBook(
    bucket: string,
    name: string,
    fields: Partial<Book> = {}
): Book {
    const book = new Book();
    book.id = "gxa5xS0Jk4";
    book.baseUrl = `https://s3.amazonaws.com/${bucket}/gxa5xS0Jk4%2f1794605671678%2f${name}%2f`;
    book.harvestState = "Done";
    book.bloomPUBVersion = 1;
    Object.assign(book, fields);
    return book;
}

const book = makeBook("BloomLibraryBooks", "Fox+and+%2b+Frog+n%c9%a8g");
const name = "Fox%20and%20%252B%20Frog%20n%C9%A8g";

describe("getArtifactUrl downloads through fs", () => {
    it("gives fs URLs for every download", () => {
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/${name}.pdf`
        );
        const folder = `${api}/fs/harvest/gxa5xS0Jk4`;
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe(
            `${folder}/epub/${name}.epub`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomReader)).toBe(
            `${folder}/${name}.bloompub`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomSource)).toBe(
            `${folder}/${name}.bloomSource`
        );
    });

    it("uses .bloomd for books harvested before BloomPUB", () => {
        const old = makeBook("BloomLibraryBooks", "Old", {
            bloomPUBVersion: undefined,
        });
        expect(getArtifactUrl(old, ArtifactType.bloomReader)).toBe(
            `${api}/fs/harvest/gxa5xS0Jk4/Old.bloomd`
        );
    });

    it("uses the dev buckets for sandbox books", () => {
        const sandbox = makeBook("BloomLibraryBooks-Sandbox", "A+Book");
        expect(getArtifactUrl(sandbox, ArtifactType.pdf)).toBe(
            `${api}/fs/dev-upload/gxa5xS0Jk4/A%20Book.pdf`
        );
        expect(getArtifactUrl(sandbox, ArtifactType.epub)).toBe(
            `${api}/fs/dev-harvest/gxa5xS0Jk4/epub/A%20Book.epub`
        );
    });

    it("offers no harvested files when the harvest isn't Done, as before", () => {
        const book = makeBook("BloomLibraryBooks", "A+Book", {
            harvestState: "InProgress",
        });
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe("");
        // The PDF doesn't depend on the harvest.
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/A%20Book.pdf`
        );
    });

    it("uses S3 when the name has malformed escapes", () => {
        const book = makeBook("BloomLibraryBooks", "100%+sure");
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            "https://s3.amazonaws.com/BloomLibraryBooks/gxa5xS0Jk4/1794605671678/100%%20sure/100%%20sure.pdf"
        );
    });

    it("leaves reading online and shellbooks alone", () => {
        expect(getArtifactUrl(book, ArtifactType.readOnline)).toBe(
            "/readBook/gxa5xS0Jk4"
        );
        expect(getArtifactUrl(book, ArtifactType.shellbook)).toMatch(
            /^bloom:\/\/localhost\/order\?/
        );
    });
});
