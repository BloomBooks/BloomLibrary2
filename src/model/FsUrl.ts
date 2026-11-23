// Builds URLs for book files served through api.bloomlibrary.org/v1/fs instead of straight from S3.
//
// Why: every direct S3 fetch is billed AWS egress and is invisible to our Cloudflare rate limits
// and bot rules. The fs endpoint (bloom-core-supabase: supabase/functions/fs plus the routing
// worker in cloudflare/worker.js) finds the book's S3 folder from its database id, so these URLs
// also don't expose the S3 address (which can contain the uploader's email).
//
// URL shape: /v1/fs/{bucket}/{bookId}/{path within the book's folder}[?v={epochMs}][&download=1]
// where bucket is "upload" or "harvest" ("dev-" prefixed for the sandbox buckets).
// The version is the time the file last changed. The worker caches a versioned URL for a year,
// so a new upload or harvest gets a new URL instead of a stale cached file. (Until the worker
// supports it, ?v= is ignored: the file is served, just not cached.)

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
// Spaces are written "+", as in the S3 URL. Bloom Reader names a book it downloads from the URL's
// path, decoded once and keeping "+", and replaces an earlier download only when the names match;
// so a space written "%20" would give an updated book a new name and leave the old copy behind.
// Throws URIError if the segment holds malformed %-escapes.
export function toFsPathSegment(s3EncodedSegment: string): string {
    const raw = decodeURIComponent(s3EncodedSegment.replace(/\+/g, " "));
    return encodeURIComponent(raw)
        .replace(/%25/g, "%2525")
        .replace(/%2B/g, "%252B")
        .replace(/%20/g, "+");
}

// apiUrl is e.g. "https://api.bloomlibrary.org/v1" (see getBloomApiUrl()).
// s3EncodedPathSegments is the path within the book's folder, each segment encoded as in the
// book's S3 URL (e.g. ["epub", "Fox+and+Frog.epub"]).
// version is when the file last changed; without a valid one the URL has no version.
// Throws URIError if a segment holds malformed %-escapes.
export function getFsUrl(
    apiUrl: string,
    bucket: string,
    bookId: string,
    s3EncodedPathSegments: string[],
    version?: Date
): string {
    const path = s3EncodedPathSegments.map(toFsPathSegment).join("/");
    const ms = version?.getTime();
    const query = ms !== undefined && !isNaN(ms) ? `?v=${ms}` : "";
    return `${apiUrl}/fs/${bucket}/${bookId}/${path}${query}`;
}

// The URL a download button should use: download=1 makes api.bloomlibrary.org send the file as a
// download, under its real name, even one a browser would otherwise show (a PDF). A link's
// download attribute can't do that: browsers ignore it for a file on another host.
export function asDownloadUrl(fsUrl: string): string {
    return `${fsUrl}${fsUrl.includes("?") ? "&" : "?"}download=1`;
}
