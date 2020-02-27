import { Book } from "../../model/Book";
import { IBasicBookInfo } from "../../connection/LibraryQueryHooks";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup
} from "../../model/ArtifactVisibilitySettings";

export enum ArtifactType {
    pdf = "pdf",
    epub = "epub",
    bloomReader = "bloomReader",
    readOnline = "readOnline",
    shellbook = "shellbook"
}

export function getArtifactUrl(book: Book, artifactType: ArtifactType): string {
    let url;
    switch (artifactType) {
        case ArtifactType.readOnline:
            return `/readBook/${book.id}`;
        case ArtifactType.bloomReader:
            url = getDownloadUrl(book, "bloomd");
            break;
        case ArtifactType.shellbook:
            //https://s3.amazonaws.com/bloomharvest-sandbox/hattonlists%40gmail.com%2fa7c32c37-a048-441d-aa12-707221c41b70/BloomBookOrder/Two+Brothers.BloomBookOrder
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
function isHarvested(book: Book | IBasicBookInfo) {
    return book && book.harvestState === "Done";
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

function getBookNameFromUrl(baseUrl: string): string | undefined {
    const lastSlashIndex = baseUrl.lastIndexOf("%2f");
    let leadin = baseUrl.substring(0, lastSlashIndex);
    let slashBeforeBookName = leadin.lastIndexOf("%2f");
    if (slashBeforeBookName < 0) {
        return undefined;
    }
    return leadin.substring(slashBeforeBookName + 3); // includes leading slash (%2f)
}

export function getHarvesterProducedThumbnailUrl(
    book: Book | IBasicBookInfo
): string | undefined {
    const harvestTime = book.harvestStartedAt;
    if (!harvestTime || new Date(harvestTime.iso) < new Date(2020, 2, 12, 11)) {
        // book not havested recently enough to have useful harvester thumbnail.
        // (We'd prefer to do this with harvester version, or even to just be
        // able to assume that any harvested book has this, but it's not yet so.
        // When it is, we can use harvestState === "Done" and remove harvestStartedAt from
        // Book, IBasicBookInfo, and the keys for BookGroup queries.)
        return undefined;
    }
    let harvesterBaseUrl = getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }
    return harvesterBaseUrl + "thumbnails/thumbnail-256.png";
}

function getDownloadUrl(book: Book, fileType: string): string | undefined {
    let harvesterBaseUrl = getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }

    let bookName = getBookNameFromUrl(book.baseUrl);

    if (bookName) {
        if (fileType === "bloomd") {
            return harvesterBaseUrl + bookName + "." + fileType;
        }
        return harvesterBaseUrl + fileType + "/" + bookName + "." + fileType;
    }
    return undefined;
}
