import { getBookshelfDisplayName } from "./Bookshelf";
import { IBookshelfResult } from "../connection/LibraryQueryHooks";

// Given a raw tag, return the simple text version we display to the user.
// e.g.
//   topic:Math => Math
//   bookshelf:Parent/Child => Parent - Child
export function getTagDisplayName(t: string, bookshelves: IBookshelfResult[]) {
    const parts = t.split(":");
    const prefix = parts[0];
    const tagKey = parts[1];
    if (prefix === "bookshelf") {
        const bookshelf = bookshelves.find(shelf => shelf.key === tagKey);
        if (bookshelf) {
            return getBookshelfDisplayName(bookshelf.englishName);
        }
    }
    return tagKey;
}
