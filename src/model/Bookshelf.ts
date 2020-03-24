import { IBookshelfResult } from "../connection/LibraryQueryHooks";
export class Bookshelf {
    public key: string;
    public displayName?: string;
    public displayNameWithParent?: string;
    public countryDisplayName?: string;

    public constructor(key: string) {
        this.key = key;
    }

    // Given a raw bookshelf key,
    // parse out the various components we might need to display in the UI.
    // e.g. given "EWW/Haiti_NABU" which has an englishName
    // (in the passed-in bookshelves array) of "Enabling Writers Workshops/Haiti_NABU",
    // "NABU" is the displayName,
    // "Enabling Writers Workshops - NABU" is the displayNameWithParent,
    // "Haiti" is the countryDisplayName
    public static parseBookshelfKey(
        bookshelfKey: string,
        bookshelves: IBookshelfResult[]
    ): Bookshelf {
        const result: Bookshelf = { key: bookshelfKey };

        const bookshelfRecord = bookshelves.find(
            shelf => shelf.key === bookshelfKey
        );
        if (bookshelfRecord) {
            const parentChildSplits = bookshelfRecord.englishName.split("/");
            if (parentChildSplits.length === 1) {
                // No parent
                const countrySplits = bookshelfRecord.englishName.split("_");
                if (countrySplits.length === 1) {
                    // No country
                    result.displayName = bookshelfRecord.englishName;
                } else {
                    result.displayName = countrySplits[1];
                    result.countryDisplayName = countrySplits[0];
                }
                result.displayNameWithParent = result.displayName;
            } else {
                // Has parent
                let childName = parentChildSplits[parentChildSplits.length - 1];
                const countrySplits = childName.split("_");
                if (countrySplits.length === 1) {
                    // No country
                } else {
                    childName = countrySplits[1];
                    // Remove country name from child shelf name
                    parentChildSplits.splice(
                        parentChildSplits.length - 1,
                        1,
                        childName
                    );
                    result.countryDisplayName = countrySplits[0];
                }
                result.displayName = childName;
                result.displayNameWithParent = parentChildSplits.join(" - ");
            }
        } else {
            result.displayName = bookshelfKey;
            result.displayNameWithParent = bookshelfKey;
        }

        return result;
    }
}
