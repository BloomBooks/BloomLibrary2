// Eventually, we want to be able to enter special key words in a Contentful Collection.
// These key words will be used (after localization via Crowdin somehow) to tell blorg that it should
// bring up a specific collection that is linked to those words.
// The key words (and their "translations") should be minimal, since a user will no longer be able
// search directly for books containing those words.

// For now we are just making the hard-coded searches in SearchBox.tsx into something a bit more
// generic.
interface searchKeys {
    keywords: string[];
    url: string;
}

// The idea is to get this array from (translated) Contenful keywords field.
const specialSearchArray: searchKeys[] = [
    {
        keywords: [
            "covid",
            "kovid",
            "covid19",
            "coronavirus",
            "cov19",
            "kovid19",
        ],
        url: "covid19",
    },
    {
        keywords: ["kingstone", "comic bible", "bible comic", "bible comics"],
        url: "super-bible",
    },
];

export function trySpecialSearch(search: string): string[] {
    const result = specialSearchArray.find((entry) =>
        entry.keywords.includes(search)
    );
    return result ? [result.url] : [];
}
