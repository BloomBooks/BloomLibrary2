import { Book } from "../../model/Book";
import { ArtifactVisibilitySettings } from "../../model/ArtifactVisibilitySettings";

export enum ArtifactType {
    pdf = "pdf",
    epub = "epub",
    bloomReader = "bloomReader",
    readOnline = "readOnline"
}

// This is what we use if the show column is not populated in parse.
// Before we started populating the show column, we only and always
// harvested epub, bloomReader, and readOnline.
export function getDefaultShowValue() {
    return {
        pdf: undefined,
        epub: new ArtifactVisibilitySettings(),
        bloomReader: new ArtifactVisibilitySettings(),
        readOnline: new ArtifactVisibilitySettings()
    };
}

export function getArtifactUrl(book: Book, artifactType: ArtifactType): string {
    let url;
    switch (artifactType) {
        case ArtifactType.readOnline:
            return `/readBook/${book.id}`;
        case ArtifactType.bloomReader:
            url = getDownloadUrl(book, "bloomd");
            break;
        default:
            url = getDownloadUrl(book, artifactType);
            break;
    }
    if (!url) return "";
    return url;
}

export function getArtifactSettings(
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
    var baseUrl = book.baseUrl;
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
    var folderWithoutLastSlash = baseUrl;
    if (baseUrl.endsWith("%2f")) {
        folderWithoutLastSlash = baseUrl.substring(0, baseUrl.length - 3);
    }
    var index = folderWithoutLastSlash.lastIndexOf("%2f");
    var pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
    return (
        pathWithoutBookName
            .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
            .replace("BloomLibraryBooks", "bloomharvest") + "/"
    );
    // Using slash rather than %2f at the end helps us download as the filename we want.
    // Otherwise, the filename can be something like ken@example.com_007b3c03-52b7-4689-80bd-06fd4b6f9f28_Fox+and+Frog.bloomd
}

function getBookNameFromUrl(baseUrl: string): string | undefined {
    var lastSlashIndex = baseUrl.lastIndexOf("%2f");
    var leadin = baseUrl.substring(0, lastSlashIndex);
    var slashBeforeBookName = leadin.lastIndexOf("%2f");
    if (slashBeforeBookName < 0) {
        return undefined;
    }
    return leadin.substring(slashBeforeBookName + 3); // includes leading slash (%2f)
}

function getDownloadUrl(book: Book, fileType: string): string | undefined {
    var harvesterBaseUrl = getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }

    var bookName = getBookNameFromUrl(book.baseUrl);

    if (bookName) {
        if (fileType === "bloomd") {
            return harvesterBaseUrl + bookName + "." + fileType;
        }
        return harvesterBaseUrl + fileType + "/" + bookName + "." + fileType;
    }
    return undefined;
}
// end functions copied from BloomLibrary's services.js
