// typical input url:
// https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f
// want:
// https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/
// We come up with that URL by
//  (a) changing BloomLibraryBooks{-Sandbox} to bloomharvest{-sandbox}
//  (b) strip off everything after the next-to-final slash
export function getHarvesterBaseUrlFromBaseUrl(
    baseUrl: string | undefined,
    isLocalhost: boolean
): string | undefined {
    if (!baseUrl) {
        return undefined;
    }

    let folderWithoutLastSlash = baseUrl;

    if (baseUrl.endsWith("%2f")) {
        folderWithoutLastSlash = baseUrl.substring(0, baseUrl.length - 3);
    }

    if (isLocalhost) {
        folderWithoutLastSlash = folderWithoutLastSlash.replace(
            "https://s3.amazonaws.com",
            "/s3"
        );
    }

    const index = folderWithoutLastSlash.lastIndexOf("%2f");
    if (index < 0) {
        return undefined;
    }

    const pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
    return (
        pathWithoutBookName
            .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
            .replace("BloomLibraryBooks", "bloomharvest") + "/"
    );
}

export function getUrlOfHtmlOfDigitalVersion(
    harvesterBaseUrl: string | undefined,
    filePath: string
): string | undefined {
    // use this if you are are working on bloom-player and are using the bloom-player npm script tobloomlibrary
    // bloomPlayerUrl = "http://localhost:3000/bloomplayer-for-developing.htm";
    // Also used to redirect navigation books within books to display the desired book

    if (!harvesterBaseUrl) {
        return undefined;
    }

    const encodedFilePath = filePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("%2f");

    return `${harvesterBaseUrl}bloomdigital%2f${encodedFilePath}`;
}
