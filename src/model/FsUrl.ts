// Builds URLs for book files served through api.bloomlibrary.org/v1/fs instead of straight from S3.
//
// Why: every direct S3 fetch is billed AWS egress and is invisible to our Cloudflare rate limits
// and bot rules. The fs endpoint (bloom-core-supabase: supabase/functions/fs plus the routing
// worker in cloudflare/worker.js) finds the book's S3 folder from its database id, so these URLs
// also don't expose the S3 address (which can contain the uploader's email).
//
// URL shape: /v1/fs/{bucket}/{bookId}[@{version}]/{path within the book's folder}
// - bucket is "upload" or "harvest" ("dev-" prefixed for the sandbox buckets).
// - version is the epoch ms of the last time the files could have changed. It lets the worker
//   cache a file for a long time: a new version is a new URL, so nothing ever needs purging.
//   It is in the path, not a query string, so that relative links inside a book (which is how
//   Bloom Player finds images, audio and css) inherit it. "@" never occurs in a Parse id, so the
//   worker can split it off.
// S3 URLs and fs URLs without a version keep working for OPDS, old links and old clients.

// Serve downloads (PDF, ePUB, BloomPUB, .bloomSource) through fs. This works with today's
// production worker as long as kFsUrlsIncludeVersion is off.
export const kServeDownloadsThroughFs = false;

// Have Bloom Player read books online through fs, so the book's html and all its relative
// assets (images, audio, css...) come through Cloudflare. Leave this off until
// kFsUrlsIncludeVersion is on: without a version the worker can't cache a book's many files for
// long, and there is no way to purge them when the book is re-harvested.
export const kReadOnlineThroughFs = false;

// Put "@{version}" in fs URLs. Leave this off until the worker in bloom-core-supabase handles
// versioned fs URLs in production: today it treats "{bookId}@{version}" as the book id, so the
// request 404s. When it is on, a file whose version we can't tell is fetched from S3 instead.
export const kFsUrlsIncludeVersion = false;

export type FsBucketKind = "upload" | "harvest";

// baseUrl is a book's baseUrl from Parse, which always points into the upload bucket
// (BloomLibraryBooks or, for the sandbox, BloomLibraryBooks-Sandbox).
export function getFsBucketName(baseUrl: string, kind: FsBucketKind): string {
    return baseUrl.includes("/BloomLibraryBooks-Sandbox/")
        ? `dev-${kind}`
        : kind;
}

// Converts one path segment as it appears in a book's S3 URL (where "+" means space and
// non-ASCII may be %-escaped or raw) to the form the fs function needs.
// The fs function decodes each segment once, then turns "+" into space, decodes again, and
// re-encodes (see encodeUnicode in supabase/functions/fs/BookData.ts). So a literal "+" or "%"
// in the name must survive two decodes; everything else needs only one level of encoding.
// Keeping the encoding to one level where possible also gives the downloaded file a readable name.
// Throws URIError if the segment holds malformed %-escapes.
export function toFsPathSegment(s3EncodedSegment: string): string {
    const raw = decodeURIComponent(s3EncodedSegment.replace(/\+/g, " "));
    return encodeURIComponent(raw)
        .replace(/%25/g, "%2525")
        .replace(/%2B/g, "%252B");
}

// The fs URL of a file in a book's folder, or undefined if we can't make one (the caller should
// then use the S3 URL).
// apiUrl is e.g. "https://api.bloomlibrary.org/v1" (see getBloomApiUrl()).
// With includeVersion, the URL carries the version, and there is no URL without a usable version.
// Without it, version is ignored.
// s3EncodedPathSegments is the path within the book's folder, each segment encoded as in the
// book's S3 URL (e.g. ["epub", "Fox+and+Frog.epub"]).
export function getFsUrl(
    apiUrl: string,
    bucket: string,
    bookId: string,
    includeVersion: boolean,
    version: Date | undefined,
    s3EncodedPathSegments: string[]
): string | undefined {
    if (!bookId) return undefined;
    let versionPart = "";
    if (includeVersion) {
        if (!version || isNaN(version.getTime())) return undefined;
        versionPart = `@${version.getTime()}`;
    }
    const path = s3EncodedPathSegments.map(toFsPathSegment).join("/");
    return `${apiUrl}/fs/${bucket}/${bookId}${versionPart}/${path}`;
}
