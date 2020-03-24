// Given a raw tag, return the simple text version we display to the user.
// e.g.
//   topic:Math => Math
export function getTagDisplayName(t: string) {
    const parts = t.split(":");
    //const prefix = parts[0];
    const tagKey = parts[1];

    // if (prefix === "bookshelf") {
    // In Mar 2020, we copied bookshelf tags to the new bookshelves column,
    // so they are handled elsewhere
    // }

    return tagKey;
}
