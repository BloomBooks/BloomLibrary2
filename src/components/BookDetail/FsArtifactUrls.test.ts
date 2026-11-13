import { describe, expect, it, vi } from "vitest";
import { Book } from "../../model/Book";
import {
    ArtifactType,
    getArtifactUrl,
    getFsHarvestedFileUrl,
} from "./ArtifactHelper";

// Turn the downloads flag on for these tests, to check what getArtifactUrl does when it is on.
vi.mock("../../model/FsUrl", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../model/FsUrl")>()),
    kServeDownloadsThroughFs: true,
}));

// Under jsdom we are on localhost, so getBloomApiUrl() gives the vite proxy's path.
const api = "/api/v1";
const uploaded = "2026-11-13T21:35:08.899Z";
const uploadedMs = Date.parse(uploaded);
const harvested = "2026-11-13T21:35:20.394Z";
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
    book.harvestStartedAt = { iso: harvested };
    book.lastUploadedDate = new Date(uploaded);
    book.bloomPUBVersion = 1;
    Object.assign(book, fields);
    return book;
}

describe("getArtifactUrl with downloads through fs", () => {
    const book = makeBook("BloomLibraryBooks", "Fox+and+%2b+Frog+n%c9%a8g");
    const harvestFolder = `${api}/fs/harvest/gxa5xS0Jk4@${harvestedMs}`;
    const name = "Fox%20and%20%252B%20Frog%20n%C9%A8g";

    it("versions the uploaded PDF by the last upload", () => {
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4@${uploadedMs}/${name}.pdf`
        );
    });

    it("versions harvested files by the harvest", () => {
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe(
            `${harvestFolder}/epub/${name}.epub`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomReader)).toBe(
            `${harvestFolder}/${name}.bloompub`
        );
        expect(getArtifactUrl(book, ArtifactType.bloomSource)).toBe(
            `${harvestFolder}/${name}.bloomSource`
        );
    });

    it("uses .bloomd for books harvested before BloomPUB", () => {
        const old = makeBook("BloomLibraryBooks", "Old", {
            bloomPUBVersion: undefined,
        });
        expect(getArtifactUrl(old, ArtifactType.bloomReader)).toBe(
            `${harvestFolder}/Old.bloomd`
        );
    });

    it("uses the dev buckets for sandbox books", () => {
        const sandbox = makeBook("BloomLibraryBooks-Sandbox", "A+Book");
        expect(getArtifactUrl(sandbox, ArtifactType.pdf)).toBe(
            `${api}/fs/dev-upload/gxa5xS0Jk4@${uploadedMs}/A%20Book.pdf`
        );
        expect(getArtifactUrl(sandbox, ArtifactType.epub)).toBe(
            `${api}/fs/dev-harvest/gxa5xS0Jk4@${harvestedMs}/epub/A%20Book.epub`
        );
    });

    it("offers no harvested files when the harvest isn't Done, as before", () => {
        const book = makeBook("BloomLibraryBooks", "A+Book", {
            harvestState: "InProgress",
        });
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe("");
        // The PDF doesn't depend on the harvest.
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            `${api}/fs/upload/gxa5xS0Jk4@${uploadedMs}/A%20Book.pdf`
        );
    });

    it("uses S3 when there is no version", () => {
        const book = makeBook("BloomLibraryBooks", "A+Book", {
            harvestStartedAt: undefined,
            lastUploadedDate: undefined,
        });
        // On localhost, Book.getHarvesterBaseUrl goes through the vite /s3 proxy.
        expect(getArtifactUrl(book, ArtifactType.epub)).toBe(
            "/s3/bloomharvest/gxa5xS0Jk4%2f1794605671678/epub/A%20Book.epub"
        );
        expect(getArtifactUrl(book, ArtifactType.pdf)).toBe(
            "https://s3.amazonaws.com/BloomLibraryBooks/gxa5xS0Jk4/1794605671678/A%20Book/A%20Book.pdf"
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

describe("getFsHarvestedFileUrl", () => {
    it("makes the base Bloom Player reads a book from", () => {
        const book = makeBook("BloomLibraryBooks", "A+Book");
        expect(getFsHarvestedFileUrl(book, ["bloomdigital", "index.htm"])).toBe(
            `${api}/fs/harvest/gxa5xS0Jk4@${harvestedMs}/bloomdigital/index.htm`
        );
    });

    it("gives nothing unless the harvest is Done", () => {
        for (const harvestState of [
            "New",
            "Requested",
            "InProgress",
            "Failed",
        ]) {
            const book = makeBook("BloomLibraryBooks", "A+Book", {
                harvestState,
            });
            expect(
                getFsHarvestedFileUrl(book, ["bloomdigital", "index.htm"])
            ).toBeUndefined();
        }
    });
});
