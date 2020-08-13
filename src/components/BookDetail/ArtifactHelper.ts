import { Book } from "../../model/Book";
import { IBasicBookInfo } from "../../connection/LibraryQueryHooks";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup,
} from "../../model/ArtifactVisibilitySettings";

export enum ArtifactType {
    pdf = "pdf",
    epub = "epub",
    bloomReader = "bloomReader",
    readOnline = "readOnline",
    shellbook = "shellbook",
}

export function getArtifactUrl(book: Book, artifactType: ArtifactType): string {
    let url;
    switch (artifactType) {
        case ArtifactType.readOnline:
            return `/readBook/${book.id}`;
        case ArtifactType.bloomReader:
            url = getDownloadUrl(book, "bloompub");
            break;
        case ArtifactType.shellbook:
            url = book.bookOrder;
            break;
        case ArtifactType.pdf:
            url = `${book.baseUrl}${getBookNameFromUrl(
                book.baseUrl
            )}.pdf`.replace(/%2f/g, "/");
            break;
        default:
            url = getDownloadUrl(book, artifactType);
            break;
    }
    if (!url) return "";
    return url;
}

// Note that this may MODIFY the object, if it previously had no settings at all
// (though this is unlikely, since books usually come from createBookFromParseServerData,
// which always creates one).
// However, this is necessary, because these settings are observable, and returning
// a different object each time defeats the observability.
// The function must NOT create a settings object for a particular field if one
// does not exist, as that would (probably falsely) indicate that the relevant
// artifact was available.
export function getArtifactVisibilitySettings(
    book: Book,
    artifactType: ArtifactType
): ArtifactVisibilitySettings | undefined {
    if (!book.artifactsToOfferToUsers) {
        book.artifactsToOfferToUsers = new ArtifactVisibilitySettingsGroup();
    }
    return book.artifactsToOfferToUsers[artifactType];
}

export function getArtifactTypeFromKey(artifactTypeKey: string): ArtifactType {
    // For some reason, Typescript makes us jump through this awkward hoop.
    return (ArtifactType as any)[artifactTypeKey];
}

// The following functions were basically copied as-is from BloomLibrary's services.js
export function isHarvested(book: Book | IBasicBookInfo) {
    return book && book.harvestState === "Done";
}

/*const cloudFlareSubstitutions = [
    {
        from: "bloomlibrary.org/books/",
        to: "https://s3.amazonaws.com/BloomLibraryBooks/"
    },
    {
        from: "bloomlibrary.org/harvested-books/",
        to: "https://s3.amazonaws.com/bloomharvest/"
    },
    {
        from: "dev.bloomlibrary.org/books/",
        to: "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/"
    },
    {
        from: "dev.bloomlibrary.org/harvested-books/",
        to: "https://s3.amazonaws.com/bloomharvest-sandbox/"
    }
];*/
function getCloudFlareUrl(inputUrl: string): string {
    // typical input url:
    // https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/
    // or
    // https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f
    // We want to go through cloudflare, which interprets various bloomlibrary.org addresses and
    // caches the data close to clients, to make retrieving things more efficient.
    // However, the book asset URLs we initially deduce from the parse server data
    // point directly to S3. So what we want is a URL that will go to CloudFlare,
    // and which CloudFlare will convert back to the S3 address we started with
    // (and then either serve it from its own cache or fetch it from S3).
    // To achieve this we have to make the opposite transformation to the one
    // CloudFlare is set to make.
    // For example, where CloudFlare has a rule like
    // bloomlibrary.org/books/* -> https://s3.amazonaws.com/BloomLibraryBooks/$1
    // we want to convert URLs starting with https://s3.amazonaws.com/BloomLibraryBooks
    // to ones starting with bloomlibrary.org/books.

    // Keeping this code in case the above actually works one day. However, we
    // discovered while trying to set up CloudFlare to actually do it that right
    // now ClouldFlare just redirects the query back to S3. Thus, the only effect of
    // going through CloudFlare is an EXTRA request. We think we need an Enterprise
    // subscription to CloudFlare to do better. So for now, just leave the URL
    // unmodified.
    // const cfSub = cloudFlareSubstitutions.find(s => inputUrl.startsWith(s.to));
    // if (cfSub) {
    //     return "https://" + cfSub.from + inputUrl.substring(cfSub.to.length);
    // }
    return inputUrl;
}

function getHarvesterBaseUrl(book: Book | IBasicBookInfo): string | undefined {
    if (!book) {
        return undefined;
    }
    const baseUrl = book.baseUrl;
    if (baseUrl == null) {
        return undefined;
    }
    if (!isHarvested(book)) {
        return undefined;
    }

    // typical input url:
    // https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f
    // want:
    // https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/
    // We come up with that URL by
    //  (a) changing BloomLibraryBooks{-Sandbox} to bloomharvest{-sandbox}
    //  (b) strip off everything after the next-to-final slash
    let folderWithoutLastSlash = baseUrl;
    if (baseUrl.endsWith("%2f")) {
        folderWithoutLastSlash = baseUrl.substring(0, baseUrl.length - 3);
    }
    const index = folderWithoutLastSlash.lastIndexOf("%2f");
    const pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
    return (
        pathWithoutBookName
            .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
            .replace("BloomLibraryBooks", "bloomharvest") + "/"
    );
    // Using slash rather than %2f at the end helps us download as the filename we want.
    // Otherwise, the filename can be something like ken@example.com_007b3c03-52b7-4689-80bd-06fd4b6f9f28_Fox+and+Frog.bloomd
}

export function getBookNameFromUrl(baseUrl: string): string | undefined {
    const lastSlashIndex = baseUrl.lastIndexOf("%2f");
    const leadin = baseUrl.substring(0, lastSlashIndex);
    const slashBeforeBookName = leadin.lastIndexOf("%2f");
    if (slashBeforeBookName < 0) {
        return undefined;
    }
    const baseFileName = leadin.substring(slashBeforeBookName + 3); // includes leading slash (%2f)
    // This code mimics Bloom Desktop's SanitizeNameForFileSystem() function,
    // mainly the logic in RemoveDangerousCharacters(). This is how the harvester comes
    // up with the name to save artifacts under.
    let result = baseFileName.replace(/["<>|:*?\\/\u00a0&'{},;()$@]/g, " ");
    while (
        result.startsWith(".") ||
        result.startsWith(" ") ||
        result.startsWith("\t")
    ) {
        result = result.substring(1);
    }
    result = result.trim();
    while (result.endsWith(".")) {
        result = result.substring(0, result.length - 1);
        result = result.trim();
    }
    if (!result) {
        // The Bloom algorithm actually answers the current localization of "Book".
        result = "Book";
    }
    return result;
}

// Get the URL where we find book thumbnails if they have not been harvested recently
// enough tohave a harvester-produced thumbnail. Includes a fake query designed to defeat
// caching of the thumbnail if the book might have been modified since last cached.
export function getLegacyThumbnailUrl(book: Book | IBasicBookInfo): string {
    return (
        getCloudFlareUrl(book.baseUrl) +
        "thumbnail-256.png?version=" +
        book.updatedAt
    );
}

// Get the URL where we find book thumbnails if they have been harvested recently
// enough tohave a harvester-produced thumbnail. Includes a fake query designed to defeat
// caching of the thumbnail if the book might have been modified since last cached.
export function getHarvesterProducedThumbnailUrl(
    book: Book | IBasicBookInfo
): string | undefined {
    const harvestTime = book.harvestStartedAt;
    if (!harvestTime || new Date(harvestTime.iso) < new Date(2020, 1, 11, 11)) {
        // That data above is FEBRUARY 12! at 11am. If the harvest time is before that,
        // the book was not havested recently enough to have a useful harvester thumbnail.
        // (We'd prefer to do this with harvester version, or even to just be
        // able to assume that any harvested book has this, but it's not yet so.
        // When it is, we can use harvestState === "Done" and remove harvestStartedAt from
        // Book, IBasicBookInfo, and the keys for BookGroup queries.)
        return undefined;
    }
    const harvesterBaseUrl = getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }
    return (
        getCloudFlareUrl(harvesterBaseUrl) +
        "thumbnails/thumbnail-256.png?version=" +
        book.updatedAt
    );
}

// Get the place we should look for a book thumbnail.
export function getThumbnailUrl(
    book: Book | IBasicBookInfo
): { thumbnailUrl: string; isModernThumbnail: boolean } {
    const h = getHarvesterProducedThumbnailUrl(book);
    if (h) return { thumbnailUrl: h, isModernThumbnail: true };
    return {
        thumbnailUrl: getLegacyThumbnailUrl(book),
        isModernThumbnail: false,
    };
}

function getDownloadUrl(book: Book, fileType: string): string | undefined {
    const harvesterBaseUrl = getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }

    const bookName = getBookNameFromUrl(book.baseUrl);

    if (bookName) {
        if (fileType === "bloompub") {
            return harvesterBaseUrl + bookName + ".bloomd";
        }
        return harvesterBaseUrl + fileType + "/" + bookName + "." + fileType;
    }
    return undefined;
}
export function getUrlOfHtmlOfDigitalVersion(book: Book) {
    const harvesterBaseUrl = getHarvesterBaseUrl(book);
    // use this if you are are working on bloom-player and are using the bloom-player npm script tobloomlibrary
    // bloomPlayerUrl = "http://localhost:3000/bloomplayer-for-developing.htm";
    return harvesterBaseUrl + "bloomdigital%2findex.htm";
}
