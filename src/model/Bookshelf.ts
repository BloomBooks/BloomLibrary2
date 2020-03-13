// Given a raw bookshelf name (which is the "englishName" or a translation of it),
// return the text we should display as the basic text representation of that bookshelf.
// e.g. given "Enabling Writers Workshops/Haiti_NABU",
// where
// "Enabling Writers Workshops" is the parent bookshelf,
// "Haiti" is the child bookshelf, and
// "NABU" is the organization name,
// return "Enabling Writers Workshops - Haiti"
export function getBookshelfDisplayName(bookshelfName: string) {
    let splits = bookshelfName.split("_");
    if (splits.length > 0) bookshelfName = splits[0];

    splits = bookshelfName.split("/");
    if (splits.length === 0) return bookshelfName;

    return splits.join(" - ");
}
