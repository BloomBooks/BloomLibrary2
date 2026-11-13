// Builds URLs for book files served through api.bloomlibrary.org/v1/fs instead of straight from S3.
//
// Why: every direct S3 fetch is billed AWS egress and is invisible to our Cloudflare rate limits
// and bot rules. The fs endpoint (bloom-core-supabase: supabase/functions/fs plus the routing
// worker in cloudflare/worker.js) finds the book's S3 folder from its database id, so these URLs
// also don't expose the S3 address (which can contain the uploader's email).
//
// URL shape: /v1/fs/{bucket}/{bookId}@{version}/{path within the book's folder}
// - bucket is "upload" or "harvest" ("dev-" prefixed for the sandbox buckets).
// - version is the epoch ms of the last time the files could have changed. It lets the worker
//   cache a file for a long time: a new version is a new URL, so nothing ever needs purging.
//   It is in the path, not a query string, so that relative links inside a book (which is how
//   Bloom Player finds images, audio and css) inherit it. "@" never occurs in a Parse id, so the
//   worker can split it off.
// We only ever build versioned URLs. When we can't tell the version, callers use the S3 URL,
// as before. Unversioned fs URLs and S3 URLs keep working for OPDS, old links and old clients.

// Serve downloads (PDF, ePUB, BloomPUB, .bloomSource) through fs.
// Leave this off until the worker in bloom-core-supabase handles versioned fs URLs in
// production (today it treats "{bookId}@{version}" as the book id, so the request 404s).
export const kServeDownloadsThroughFs = false;

// Have Bloom Player read books online through fs, so the book's html and all its relative
// assets (images, audio, css...) come through Cloudflare.
// Leave this off until the worker handles versioned fs URLs in production (see above).
export const kReadOnlineThroughFs = false;

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

// The versioned fs URL of a file in a book's folder, or undefined if there is no usable version
// (the caller should then use the S3 URL).
// apiUrl is e.g. "https://api.bloomlibrary.org/v1" (see getBloomApiUrl()).
// s3EncodedPathSegments is the path within the book's folder, each segment encoded as in the
// book's S3 URL (e.g. ["epub", "Fox+and+Frog.epub"]).
export function getFsUrl(
    apiUrl: string,
    bucket: string,
    bookId: string,
    version: Date | undefined,
    s3EncodedPathSegments: string[]
): string | undefined {
    if (!bookId || !version || isNaN(version.getTime())) return undefined;
    const path = s3EncodedPathSegments.map(toFsPathSegment).join("/");
    return `${apiUrl}/fs/${bucket}/${bookId}@${version.getTime()}/${path}`;
}
