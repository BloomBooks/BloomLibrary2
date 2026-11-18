import { describe, expect, it } from "vitest";
import { Book } from "../../model/Book";
import { ArtifactType, getArtifactUrl } from "./ArtifactHelper";

// Under jsdom we are on localhost, so getBloomApiUrl() gives the vite proxy's path.
const api = "/api/v1";

const uploaded = "2025-03-04T05:06:07.890Z";
const uploadedMs = Date.parse(uploaded);
const harvested = "2025-03-05T01:02:03.456Z";
const harvestedMs = Date.parse(harvested);

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
    book.lastUploadedDate = new Date(uploaded);
    book.harvestStartedAt = { iso: harvested };
    Object.assign(book, fields);
    return book;
}

const book = makeBook("BloomLibraryBooks", "Fox+and+%2b+Frog+n%c9%a8g");
const name = "Fox%20and%20%252B%20Frog%20n%C9%A8g";

describe("getArtifactUrl downloads through fs", () => {
    it("versions the PDF by the upload and harvested files by the harvest", () => {
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/${name}.pdf?v=${uploadedMs}`
        );
        const folder = `${api}/fs/harvest/gxa5xS0Jk4`;
        const v = `?v=${harvestedMs}`;
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe(
            `${folder}/epub/${name}.epub${v}`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomReader)).toBe(
            `${folder}/${name}.bloompub${v}`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomSource)).toBe(
            `${folder}/${name}.bloomSource${v}`
        );
    });

    it("leaves the version off when the book has none", () => {
        const noVersions = makeBook("BloomLibraryBooks", "A+Book", {
            lastUploadedDate: undefined,
            harvestStartedAt: undefined,
        });
        expect(getArtifactUrl(noVersions, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/A%20Book.pdf`
        );
        expect(getArtifactUrl(noVersions, ArtifactType.epub)).toBe(
            `${api}/fs/harvest/gxa5xS0Jk4/epub/A%20Book.epub`
        );
        const badDates = makeBook("BloomLibraryBooks", "A+Book", {
            lastUploadedDate: new Date("not a date"),
            harvestStartedAt: { iso: "not a date" },
        });
        expect(getArtifactUrl(badDates, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/A%20Book.pdf`
        );
        expect(getArtifactUrl(badDates, ArtifactType.bloomReader)).toBe(
            `${api}/fs/harvest/gxa5xS0Jk4/A%20Book.bloompub`
        );
    });

    it("uses .bloomd for books harvested before BloomPUB", () => {
        const old = makeBook("BloomLibraryBooks", "Old", {
            bloomPUBVersion: undefined,
        });
        expect(getArtifactUrl(old, ArtifactType.bloomReader)).toBe(
            `${api}/fs/harvest/gxa5xS0Jk4/Old.bloomd?v=${harvestedMs}`
        );
    });

    it("uses the dev buckets for sandbox books", () => {
        const sandbox = makeBook("BloomLibraryBooks-Sandbox", "A+Book");
        expect(getArtifactUrl(sandbox, ArtifactType.pdf)).toBe(
            `${api}/fs/dev-upload/gxa5xS0Jk4/A%20Book.pdf?v=${uploadedMs}`
        );
        expect(getArtifactUrl(sandbox, ArtifactType.epub)).toBe(
            `${api}/fs/dev-harvest/gxa5xS0Jk4/epub/A%20Book.epub?v=${harvestedMs}`
        );
    });

    it("offers no harvested files when the harvest isn't Done, as before", () => {
        const book = makeBook("BloomLibraryBooks", "A+Book", {
            harvestState: "InProgress",
        });
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe("");
        expect(getArtifactUrl(book, ArtifactType.bloomReader)).toBe("");
        // The PDF doesn't depend on the harvest.
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4/A%20Book.pdf?v=${uploadedMs}`
        );
    });

    it("never falls back to S3: no link when there is no fs URL", () => {
        const malformed = makeBook("BloomLibraryBooks", "100%+sure");
        for (const type of [
            ArtifactType.pdf,
            ArtifactType.epub,
            ArtifactType.bloomReader,
            ArtifactType.bloomSource,
        ]) {
            expect(getArtifactUrl(malformed, type)).toBe("");
        }
        // A hostile baseUrl can't become the link either.
        const hostile = new Book();
        hostile.id = "gxa5xS0Jk4";
        hostile.baseUrl = "javascript:alert(1)//%2fa%2f%zz%2f";
        hostile.harvestState = "Done";
        expect(getArtifactUrl(hostile, ArtifactType.pdf)).toBe("");
        expect(getArtifactUrl(hostile, ArtifactType.epub)).toBe("");
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
