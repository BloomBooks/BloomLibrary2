import { useCookies } from "react-cookie";

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

// export function setCookie(
//     cookieName: string,
//     cookieValue: string,
//     daysToExpiration: number
// ) {
//     const expirationTime = new Date();
//     expirationTime.setTime(
//         expirationTime.getTime() + daysToExpiration * 24 * 60 * 60 * 1000
//     );
//     const expires = "expires=" + expirationTime.toUTCString();
//     document.cookie =
//         cookieName + "=" + cookieValue + ";" + expires + ";path=/";
// }

export function useShowTroubleshootingStuff(): [
    on: boolean,
    setOn: (on: boolean) => void
] {
    const [cookies, setCookie] = useCookies(["showTroubleshootingStuff"]);

    return [
        cookies.showTroubleshootingStuff === "true",
        (on: boolean) => {
            setCookie("showTroubleshootingStuff", on.toString());
        },
    ];
}

export function getCookie(cookieName: string) {
    const name = cookieName + "=";
    const cookieArray = document.cookie.split(";");
    for (let i = 0; i < cookieArray.length; i++) {
        let nameEqualsVal = cookieArray[i];
        while (nameEqualsVal.charAt(0) === " ") {
            nameEqualsVal = nameEqualsVal.substring(1);
        }
        if (nameEqualsVal.indexOf(name) === 0) {
            return nameEqualsVal.substring(name.length, nameEqualsVal.length);
        }
    }
    return "";
}

function twoDigit(input: number): string {
    return input >= 10
        ? input.toString().substring(0, 2)
        : "0" + input.toString().substring(0);
}

// Given a UTC date, format as YYYY-MM-DD
export function toYyyyMmDd(date: Date) {
    const result =
        date.getUTCFullYear() +
        "-" +
        twoDigit(date.getUTCMonth() + 1) +
        "-" +
        twoDigit(date.getUTCDate());
    return result;
}
