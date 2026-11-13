import { describe, expect, it } from "vitest";
import { getFsBucketName, getFsUrl, toFsPathSegment } from "./FsUrl";

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

    it("keeps ordinary names readable for the downloaded file name", () => {
        expect(toFsPathSegment("Fox+and+Frog.epub")).toBe(
            "Fox%20and%20Frog.epub"
        );
        expect(toFsPathSegment("n%c9%a8g.epub")).toBe("n%C9%A8g.epub");
        expect(toFsPathSegment("nɨg.epub")).toBe("n%C9%A8g.epub");
    });

    it("throws on malformed escapes, which callers catch", () => {
        expect(() => toFsPathSegment("100%+sure.pdf")).toThrow(URIError);
    });
});

describe("getFsUrl", () => {
    const api = "https://api.bloomlibrary.org/v1";

    it("puts the version after the book id as epoch ms", () => {
        expect(
            getFsUrl(
                api,
                "harvest",
                "XmdUIm6vEa",
                true,
                new Date("2026-10-01T12:00:00.000Z"),
                ["epub", "Fox+and+Frog.epub"]
            )
        ).toBe(
            `${api}/fs/harvest/XmdUIm6vEa@1790856000000/epub/Fox%20and%20Frog.epub`
        );
    });

    it("leaves the version out when told to, whether or not there is one", () => {
        expect(
            getFsUrl(api, "harvest", "XmdUIm6vEa", false, new Date(1000), [
                "epub",
                "Fox+and+Frog.epub",
            ])
        ).toBe(`${api}/fs/harvest/XmdUIm6vEa/epub/Fox%20and%20Frog.epub`);
        expect(
            getFsUrl(api, "upload", "XmdUIm6vEa", false, undefined, ["A.pdf"])
        ).toBe(`${api}/fs/upload/XmdUIm6vEa/A.pdf`);
    });

    it("encodes every segment of the path", () => {
        expect(
            getFsUrl(api, "dev-upload", "abc", true, new Date(1000), [
                "audio",
                "one+%2b+one.mp3",
            ])
        ).toBe(`${api}/fs/dev-upload/abc@1000/audio/one%20%252B%20one.mp3`);
    });

    it("gives no versioned URL without a usable version, so the caller uses S3", () => {
        expect(
            getFsUrl(api, "upload", "XmdUIm6vEa", true, undefined, ["A.pdf"])
        ).toBeUndefined();
        expect(
            getFsUrl(api, "upload", "XmdUIm6vEa", true, new Date("bad"), [
                "A.pdf",
            ])
        ).toBeUndefined();
    });

    it("gives no URL without a book id", () => {
        expect(
            getFsUrl(api, "upload", "", false, new Date(1000), ["A.pdf"])
        ).toBeUndefined();
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
