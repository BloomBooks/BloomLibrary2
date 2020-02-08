import { Book } from "../../model/Book";
import { ArtifactVisibilitySettings } from "../../model/ArtifactVisibilitySettings";

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

export function getArtifactVisibilitySettings(
    book: Book,
    artifactType: ArtifactType
): ArtifactVisibilitySettings {
    if (
        book.artifactsToOfferToUsers &&
        book.artifactsToOfferToUsers[artifactType] !== undefined
    ) {
        // I don't fully understand why, but if we just return
        // book.artifactsToOfferToUsers[artifactType] here, the object returned is not
        // a *true* ShowSettings object with methods, etc.
        const artifactShowSettings: ArtifactVisibilitySettings = book
            .artifactsToOfferToUsers[
            artifactType
        ] as ArtifactVisibilitySettings;
        return new ArtifactVisibilitySettings(
            artifactShowSettings.harvester,
            artifactShowSettings.librarian,
            artifactShowSettings.user
        );
    } else {
        return new ArtifactVisibilitySettings();
    }
}

export function getArtifactTypeFromKey(artifactTypeKey: string): ArtifactType {
    // For some reason, Typescript makes us jump through this awkward hoop.
    return (ArtifactType as any)[artifactTypeKey];
}

// The following functions were basically copied as-is from BloomLibrary's services.js
function isHarvested(book: Book) {
    return book && book.harvestState === "Done";
}

function getHarvesterBaseUrl(book: Book): string | undefined {
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
