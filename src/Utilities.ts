// Escape characters which would otherwise be treated as special characters in a regex.
// If input is encompasses by slashes, assume we want to treat it as an actual regex, so don't escape, and return only the contents.
export function processRegExp(stringToEscape: string) {
    const matches = stringToEscape.match(/^\/(.+)\/$/);
    return matches?.length
        ? matches[1] // first matching group is second element is array
        : stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
