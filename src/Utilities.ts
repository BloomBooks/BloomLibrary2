export function escapeRegExp(stringToEscape: string) {
    return stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
