import { describe, expect, it } from "vitest";
import {
    asDownloadUrl,
    getFsBucketName,
    getFsUrl,
    toFsPathSegment,
} from "./FsUrl";

// What the fs function does to one path segment before appending it to the S3 folder URL:
// handler.ts decodes it once, then encodeUnicode() in BookData.ts turns "+" into space, decodes
// and re-encodes. Kept in step with bloom-core-supabase/supabase/functions/fs.
function fsFunctionResolves(segment: string): string {
    const afterHandler = decodeURIComponent(segment);
    const s = decodeURIComponent(afterHandler.replace(/\+/g, " "));
    return encodeURIComponent(s);
}

// The S3 key a segment from a book's baseUrl really names, in the form fs will request it.
function s3KeyOf(s3EncodedSegment: string): string {
    return encodeURIComponent(
        decodeURIComponent(s3EncodedSegment.replace(/\+/g, " "))
    );
}

describe("toFsPathSegment", () => {
    const names = [
        "Fox+and+Frog.epub",
        "one+%2b+one.pdf", // a literal "+" in the title
        "%d0%90%2b%d0%90.bloompub", // a real one: "А+А"
        "100%25+sure.bloompub", // a literal "%"
        "%2525.pdf", // a title that is literally "%25"
        "Book+with+%23+and+%3d+n%c9%a8g.epub",
        "nɨg+raw+unicode.epub", // the baseUrl can hold raw non-ASCII
        "%e0%b8%aa%e0%b8%a7%e0%b8%b1%e0%b8%aa%e0%b8%94%e0%b8%b5.pdf", // Thai, escaped
        "El+Ni%c3%b1o.pdf",
        "L%e2%80%99histoire+de+Kande++Ce+qu%e2%80%99une.epub", // two spaces in a row
        "it's+(fun)!.pdf",
        "a%40b.epub",
        "?#&=;.epub",
    ];
    for (const name of names) {
        it(`reaches the right S3 file for ${name}`, () => {
            expect(fsFunctionResolves(toFsPathSegment(name))).toBe(
                s3KeyOf(name)
            );
        });
    }

    it("encodes ordinary names only once, with spaces as +", () => {
        expect(toFsPathSegment("Fox+and+Frog.epub")).toBe("Fox+and+Frog.epub");
        expect(toFsPathSegment("n%c9%a8g.epub")).toBe("n%C9%A8g.epub");
        expect(toFsPathSegment("nɨg.epub")).toBe("n%C9%A8g.epub");
    });

    // Bloom Reader names a downloaded book from the URL's path as Android's Uri.getPath() gives
    // it: %-escapes decoded once, "+" kept. It replaces an earlier download of the book only when
    // that name matches, so it must match the name the S3 URL gave. (Titles with a literal "+" or
    // "%" are the exception: fs needs those encoded twice.)
    const bloomReaderFileName = (urlSegment: string) =>
        decodeURIComponent(urlSegment);
    for (const name of [
        "Fox+and+Frog.bloompub",
        "El+Ni%c3%b1o.bloompub",
        "nɨg+raw+unicode.bloompub",
        "%e0%b8%aa%e0%b8%a7%e0%b8%b1%e0%b8%aa%e0%b8%94%e0%b8%b5.bloompub",
        "L%e2%80%99histoire+de+Kande++Ce+qu%e2%80%99une.bloompub",
        "it's+(fun)!.bloompub",
    ]) {
        it(`gives Bloom Reader the same file name as the S3 URL for ${name}`, () => {
            expect(bloomReaderFileName(toFsPathSegment(name))).toBe(
                bloomReaderFileName(name)
            );
        });
    }

    it("throws on malformed escapes, which callers catch", () => {
        expect(() => toFsPathSegment("100%+sure.pdf")).toThrow(URIError);
    });
});

describe("getFsUrl", () => {
    const api = "https://api.bloomlibrary.org/v1";

    it("puts the bucket, book id and encoded path after /fs", () => {
        expect(
            getFsUrl(api, "harvest", "XmdUIm6vEa", [
                "epub",
                "Fox+and+Frog.epub",
            ])
        ).toBe(`${api}/fs/harvest/XmdUIm6vEa/epub/Fox+and+Frog.epub`);
        expect(getFsUrl(api, "dev-upload", "abc", ["one+%2b+one.pdf"])).toBe(
            `${api}/fs/dev-upload/abc/one+%252B+one.pdf`
        );
    });

    it("adds ?v= with the version in epoch ms, only when the version is valid", () => {
        const at = new Date("2025-03-04T05:06:07.890Z");
        expect(getFsUrl(api, "harvest", "abc", ["a.epub"], at)).toBe(
            `${api}/fs/harvest/abc/a.epub?v=${at.getTime()}`
        );
        expect(getFsUrl(api, "harvest", "abc", ["a.epub"], undefined)).toBe(
            `${api}/fs/harvest/abc/a.epub`
        );
        expect(
            getFsUrl(api, "harvest", "abc", ["a.epub"], new Date("nope"))
        ).toBe(`${api}/fs/harvest/abc/a.epub`);
    });
});

describe("getFsBucketName", () => {
    it("uses the dev buckets for sandbox books", () => {
        const sandbox =
            "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2fabc%2fBook%2f";
        const prod =
            "https://s3.amazonaws.com/BloomLibraryBooks/ken%40example.com%2fabc%2fBook%2f";
        expect(getFsBucketName(sandbox, "harvest")).toBe("dev-harvest");
        expect(getFsBucketName(sandbox, "upload")).toBe("dev-upload");
        expect(getFsBucketName(prod, "harvest")).toBe("harvest");
        expect(getFsBucketName(prod, "upload")).toBe("upload");
    });

    it("isn't fooled by a book named after the sandbox bucket", () => {
        expect(
            getFsBucketName(
                "https://s3.amazonaws.com/BloomLibraryBooks/x%2fy%2fBloomLibraryBooks-Sandbox%2f",
                "upload"
            )
        ).toBe("upload");
    });
});

describe("asDownloadUrl", () => {
    it("adds download=1 after any version", () => {
        const base = "https://api.bloomlibrary.org/v1/fs/upload/abc/Book.pdf";
        expect(asDownloadUrl(base)).toBe(`${base}?download=1`);
        expect(asDownloadUrl(`${base}?v=123`)).toBe(`${base}?v=123&download=1`);
    });
});
