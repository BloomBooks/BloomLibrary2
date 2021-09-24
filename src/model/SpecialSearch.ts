import { setLanguageOverride } from "../localization/LocalizationProvider";
import { featureSpecs, getLocalizedLabel } from "../components/FeatureHelper";
import { ILanguage } from "./Language";

// We enter special key words in a Contentful Collection.
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

export const noPushCode: string = "xNoPushx";

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

export function trySpecialSearch(
    search: string,
    languagesByBookCount: ILanguage[]
): string[] {
    // These 'magic' strings cause a file to be written without changing the state of the page.
    if (search === "freelearningiocsv" || search === "csv") {
        giveFreeLearningCsvAsync();
        return [noPushCode];
    }

    if (search === "grid") {
        return ["grid"]; // sends the user to the grid page.
    }

    // Allow developers/testers to switch the uilang by typing "uilang=fr". Only marginally useful
    // because you lose it when you refresh. But it was going to be a pain to preserve it as
    // a url parameter. Note that you can change your lang in browser settings pretty easily for a
    // more permanent effect.
    if (search.indexOf("uilang=") === 0) {
        setLanguageOverride(search.split("=")[1]);
        return [noPushCode];
    }

    const result = specialSearchArray.find((entry) =>
        entry.keywords.includes(search)
    );
    if (result) {
        return [result.url];
    }

    const languageSearchResult = tryHandleLanguageSearch(
        search === "chinese" ? "chinese, simplified" : search,
        languagesByBookCount
    );
    if (languageSearchResult !== "") {
        return [languageSearchResult];
    }
    const featureSearchResult = tryHandleFeatureSearch(search);
    return featureSearchResult !== "" ? [featureSearchResult] : [];
}

function tryHandleLanguageSearch(
    searchStringLower: string,
    languagesByBookCount: ILanguage[]
): string {
    const matchingLanguage = languagesByBookCount.find(
        (l) =>
            l.name.toLowerCase() === searchStringLower ||
            l.englishName?.toLowerCase() === searchStringLower
    );
    if (matchingLanguage) {
        return `language:${matchingLanguage.isoCode}`;
    }
    return "";
}

function tryHandleFeatureSearch(searchStringLower: string): string {
    const matchingFeature = featureSpecs.find(
        (f) =>
            f.englishLabel.toLowerCase() === searchStringLower ||
            getLocalizedLabel(f).toLowerCase() === searchStringLower
    );
    if (matchingFeature) {
        return `${
            matchingFeature.collectionHref || matchingFeature.featureKey
        }`;
    }
    return "";
}

async function giveFreeLearningCsvAsync() {
    const { giveFreeLearningCsv } = await import(
        "../export/freeLearningIO" /* webpackChunkName: "freeLearningCsv" */
    );
    giveFreeLearningCsv();
}
