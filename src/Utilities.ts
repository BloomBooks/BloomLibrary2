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

// Removes punctuation from a string
export function removePunctuation(text: string): string {
    const punctuationRegEx = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/g;
    return text.replace(punctuationRegEx, "");
}

// We want some elements to be there but not seen, so screeen readers can find them.
// https://www.accessibility-developer-guide.com/examples/hiding-elements/visually/ says this is the best way to
// hide them visully while still letting the screen reader find them.
export const propsToHideAccessibilityElement =
    "position:absolute;left_-10000px;top:auto;width:1px;height:1px;overflow:hidden;";

export function setCookie(cname: string, cvalue: string, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname: string) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
