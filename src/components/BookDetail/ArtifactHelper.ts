import { Book, ArtifactType } from "../../model/Book";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup,
} from "../../model/ArtifactVisibilitySettings";
import { IntlShape } from "react-intl";

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
            // We need the raw book name here, because we're going for the PDF
            // the Bloom uploaded, and it doesn't apply the same cleanup as the
            // harvester.
            url = `${book.baseUrl}${getRawBookNameFromUrl(
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

export function getArtifactDownloadAltText(
    artifactType: ArtifactType,
    l10n: IntlShape
): string {
    switch (artifactType) {
        case ArtifactType.pdf:
            return l10n.formatMessage({
                id: "book.artifacts.pdf",
                defaultMessage: "Download PDF",
            });
        case ArtifactType.epub:
            return l10n.formatMessage({
                id: "book.artifacts.epub",
                defaultMessage: "Download ePUB",
            });
        case ArtifactType.bloomReader:
            return l10n.formatMessage({
                id: "book.artifacts.bloompub",
                defaultMessage:
                    "Download BloomPUB for Bloom Reader or BloomPub Viewer",
            });
        case ArtifactType.readOnline:
            return "";
        case ArtifactType.shellbook:
            return l10n.formatMessage({
                id: "book.detail.translateButton.download",
                defaultMessage: "Download into Bloom Editor",
            });
    }
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

export function getRawBookNameFromUrl(baseUrl: string): string | undefined {
    const lastSlashIndex = baseUrl.lastIndexOf("%2f");
    const leadin = baseUrl.substring(0, lastSlashIndex);
    const slashBeforeBookName = leadin.lastIndexOf("%2f");
    if (slashBeforeBookName < 0) {
        return undefined;
    }
    return leadin.substring(slashBeforeBookName + 3); // includes leading slash (%2f)
}
export function getBookNameFromUrl(baseUrl: string): string | undefined {
    const baseFileName = getRawBookNameFromUrl(baseUrl);
    if (!baseFileName) {
        return undefined;
    }
    let result = decodeURIComponent(baseFileName);
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

function getDownloadUrl(book: Book, fileType: string): string | undefined {
    const harvesterBaseUrl = Book.getHarvesterBaseUrl(book);
    if (!harvesterBaseUrl) {
        return undefined;
    }

    const bookName = getBookNameFromUrl(book.baseUrl);

    if (bookName) {
        if (fileType === "bloompub") {
            const fileExt =
                book.bloomPUBVersion && book.bloomPUBVersion >= 1
                    ? ".bloompub"
                    : ".bloomd";
            return harvesterBaseUrl + bookName + fileExt;
        }
        return harvesterBaseUrl + fileType + "/" + bookName + "." + fileType;
    }
    return undefined;
}
export function getUrlOfHtmlOfDigitalVersion(book: Book) {
    const harvesterBaseUrl = Book.getHarvesterBaseUrl(book);
    // use this if you are are working on bloom-player and are using the bloom-player npm script tobloomlibrary
    // bloomPlayerUrl = "http://localhost:3000/bloomplayer-for-developing.htm";
    return harvesterBaseUrl + "bloomdigital%2findex.htm";
}
