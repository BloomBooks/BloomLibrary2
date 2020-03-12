export function getBookshelfDisplayName(bookshelfName: string) {
    let splits = bookshelfName.split("_");
    if (splits.length > 0) bookshelfName = splits[0];

    splits = bookshelfName.split("/");
    if (splits.length === 0) return bookshelfName;

    return splits.join(" - ");
}
