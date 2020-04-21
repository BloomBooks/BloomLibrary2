// Escape characters which would otherwise be treated as special characters in a regular expression.
// If input is surrounded by forward slashes, assume the user entered a deliberate regular expression,
// so don't escape, and return only the contents.
// This also allows our code to pass regular expressions in the future.
// e.g.
//      /myr*egex/ => myr*egex
//      myr*egex => myr\*egex
export function processRegExp(stringToEscape: string) {
    const matches = stringToEscape.match(/^\/(.+)\/$/);
    return matches?.length
        ? matches[1] // first matching group is second element in array
        : stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
