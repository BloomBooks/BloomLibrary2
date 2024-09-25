import { Book } from "../../model/Book";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup,
} from "../../model/ArtifactVisibilitySettings";
import { IntlShape } from "react-intl";

// The order here matters. See ArtifactVisibilityPanel.getExistingArtifactTypeKeys().
export enum ArtifactType {
    pdf = "pdf",
    epub = "epub",
    bloomReader = "bloomReader",
    readOnline = "readOnline",
    shellbook = "shellbook",
    bloomSource = "bloomSource",
}

export function getArtifactUrl(
    book: Book,
    artifactType: ArtifactType,
    // only used for shellbook, true if we want to download for editing.
    // In some ways I would prefer to have a separate artifact type for this, but
    // we don't want a new entry for that in ArtifactVisibilitySettings.
    forEdit?: boolean
): string {
    let url;
    switch (artifactType) {
        case ArtifactType.readOnline:
            return `/readBook/${book.id}`;
        case ArtifactType.bloomReader:
            url = getDownloadUrl(book, "bloompub");
            break;
        case ArtifactType.shellbook:
            url = getBookOrderUrl(book, !!forEdit);
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

    // Whatever writes the `baseUrl` to our books database encodes space as `+` (at least up through now, August 2024).
    // This messes up the file name when you download, as you get "Hello+World.pdf".
    // So here we just re-encode the `+` as `%20` and when downloaded the file is "Hello World.pdf".
    // Since those URLs encode `+` as `%2b`, "one + one = two.pdf" will also to come out correctly.
    url = url.replace(/\+/g, "%20");

    return url;
}

function getBookOrderUrl(book: Book, forEdit: boolean) {
    if (!book.baseUrl) return "";

    // Generate a bookOrder URL from the baseUrl. We used to create and store the bookOrder as a field
    // in parse. It was actually a pointer to a .BloomBookOrder file which has been obsolete for some time.
    // In Sept 2023, we realized we could simplify things. We weren't using anything from the bookOrder
    // other than the S3 bucket and the first part of the directory structure (which up to now has always
    // been the uploader email address and book instance ID). We can just get those from the baseUrl.
    // Now, when we change the baseUrl, we just generate a new corresponding bookOrder URL.
    // Currently, a baseUrl looks like
    //           https://s3.amazonaws.com/ BloomLibraryBooks-Sandbox/andrew_polk%40sil.org%2f7195f6af-caa2-44b1-8aab-df0703ab5c4a%2f calibri%2f
    // and the bookOrder URL we want to generate looks like
    //  bloom://localhost/order?orderFile= BloomLibraryBooks-Sandbox/andrew_polk%40sil.org%2f7195f6af-caa2-44b1-8aab-df0703ab5c4a%2f &title=calibri
    // (spaces added to show the matching part we want to extract)

    // This is tested as far back as 4.8, three years before this change to not simply return the bookOrder field.
    // Note that Blooms before 5.6 expect to have two slashes (%2f) in the orderFile param and will fail otherwise. BL-12568.
    const match = /https:\/\/s3\.amazonaws\.com\/(.*?%2f.*?%2f)/.exec(
        book.baseUrl
    );
    if (match) {
        // I wasn't sure what to put for our initial minVersion.
        // We are introducing checking it in Bloom 5.5, so we could use that.
        // But clearly versions prior to that still work with the current format.
        // I thought about 1.0, but I'm sure it doesn't work that far back.
        // I chose 4.8 because I actually tested that to make sure it ignores the minVersion parameter.
        // I tested 4.8 because it was published about 3 years prior to this change.
        // The earliest version that we plan to check this for is 5.5, so it doesn't really
        // matter what version we put earlier than that for normal downloads, which are handled
        // by all the versions that do this check.
        // We do need 6.0 to handle the forEdit parameter, so we will pass that and retrofit at least
        // 5.5 and 5.6 to do the check.
        const minVersion = forEdit ? "6.0" : "4.8"; // string to ensure it's passed with a decimal point value

        const forEditPart = forEdit
            ? `&forEdit=true&database-id=${book.id}`
            : "";
        return `bloom://localhost/order?orderFile=${
            match[1]
        }&title=${encodeURIComponent(
            book.title
        )}&minVersion=${minVersion}${forEditPart}`;
    }

    return "";
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
        case ArtifactType.shellbook:
            return l10n.formatMessage({
                id: "book.detail.translateButton.download",
                defaultMessage: "Download into Bloom Editor",
            });
        default:
            return "";
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

// Given the URL stored in a book on parse, extract the part that corresponds to the file
// name. This is to be made into a parallel URL in the harvester output, so we don't need
// to decode or encode, just extract the relevant part and handle some special cases.
// This needs to be consistent with how harvester works, so we get a URL that actually
// locates the harvester artifact.
export function getBookNamePartOfUrl(baseUrl: string): string | undefined {
    const baseFileName = getRawBookNameFromUrl(baseUrl);
    if (!baseFileName) {
        return undefined;
    }
    // don't be tempted to decode it. It's already part of a URL, and may be
    // used as part of another, so decoding will mess up (e.g.) a character
    // that started out as a plus and got converted to %2b.
    let result = baseFileName;
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

    const bookName = getBookNamePartOfUrl(book.baseUrl);

    if (bookName) {
        if (fileType === "bloompub" || fileType === "bloomSource") {
            let fileExt = `.${fileType}`;
            if (fileType === "bloompub") {
                fileExt =
                    book.bloomPUBVersion && book.bloomPUBVersion >= 1
                        ? ".bloompub"
                        : ".bloomd";
            }
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
