import useAxios from "@use-hooks/axios";
import { useMemo, useState } from "react";

interface IStringMap {
    [id: string]: string;
}

interface IFilenamesToL10nJson {
    [id: string]: IStringMap;
}

interface ILocalizations {
    closestLanguage: string;
    stringsForThisLanguage: IStringMap;
}

export function useGetLocalizations(
    // explicitLanguageSetting is a language that the user has selected with our UI (not the browser's).
    // If it is undefined  (this would be the normal case) or if we can't provide it for some reason we'll go and look at their browser languages.
    explicitLanguageSetting: string | undefined // BCP 47
): ILocalizations {
    const files = [
        // enhance: we could have crowdin-sync leave us with a list that it generated
        // This gets manually maintained (as of Nov 2020) and uploaded to crowdin by crowdin-sync
        "Code Strings.json",
        // these are generated and put on Crowdin by an Azure Function that runs daily
        "Contentful High Priority.json",
        "Contentful Low Priority.json",
        "Contentful Bible Terms.json",
    ];
    const [translationFiles] = useState<IFilenamesToL10nJson>({});

    const closestLanguage = useMemo<string>(() => {
        return chooseClosestLanguageWeActuallyHave(
            explicitLanguageSetting,
            // enhance: how do we come up with this list? Putting aside what it means to "have",
            // we could have the crowdin-sync leave us with a list. But it's not totally clear what this buys us...
            // if we request a language that isn't there, well we just fall back to English anyways?
            // Note that chooseClosestLanguageWeActuallyHave() is really just looking at codes, it doesn't have a fallback hierarchy...
            // we could just have a manual mapping. So any "es" goes to "es-ES" until someone makes a different spanish.
            ["es-ES", "fr", "id", "ru", "zh-CN"]
        );
    }, [explicitLanguageSetting]);

    for (const filename of files) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { response: jsonResponse } = useAxios({
            url: `translations/${closestLanguage}/BloomLibrary.org/${encodeURIComponent(
                filename
            )}`,
            method: "GET",
            trigger: "true",
        });
        const json: any =
            jsonResponse && jsonResponse["data"] ? jsonResponse["data"] : "";
        if (json && !translationFiles[filename]) {
            translationFiles[filename] = getJsonLocalizations(
                json,
                closestLanguage
            );
        }
    }

    let translations: IStringMap = {};
    for (const filename of files) {
        translations = { ...translations, ...translationFiles[filename] };
    }
    return {
        closestLanguage,
        stringsForThisLanguage: translations,
    };
}

// Here we are transforming "Chrome JSON" format into the key:value format expected by our L10n framework
// Note that if we did this in crowdin-sync instead, we could avoid the cost of transporting any descriptions, which are unused at runtime.
function getJsonLocalizations(json: any, languageCode: string): IStringMap {
    const translations: IStringMap = {};
    Object.keys(json).forEach((k) => {
        translations[k.toLowerCase()] = json[k].message;
    });
    return translations;
}

function chooseClosestLanguageWeActuallyHave(
    preferredLanguageTag: string | undefined,
    languagesWeHave: string[]
): string {
    if (languagesWeHave.length === 0) return "error";

    const orderedListOfLanguagesToLookFor = [...getListOfPreferredLanguages()];
    if (preferredLanguageTag) {
        orderedListOfLanguagesToLookFor.unshift(preferredLanguageTag);
    }
    let best = "en";
    orderedListOfLanguagesToLookFor.find((tag: string) => {
        if (languagesWeHave.includes(tag)) {
            best = tag;
            return true;
        }
        // strip off the region part of the tag, and see if we have a match for the primary part
        const primary = tag.split("-")[0];
        if (primary === "en") {
            return true;
        }

        // FIRST: exact match
        if (languagesWeHave.includes(primary)) {
            best = primary;
            return true;
        }

        // SECOND: match language but no dialect (Primary part of the BCP47 code). If someone wants Portuguese from Brazil, and we just have pt-PT, we should give them that.
        // Note, this heuristic could be wrong. It could be that we shouldn't try and be smart, we should just trust that the user would explicitly tell his browser
        // that, for example, he'd like pt-BR but if that's not available, he wants pt-PT.
        const firstLanguageMatchingPrimaryPart = languagesWeHave.find(
            (l) => l.split("-")[0] === primary
        );
        if (firstLanguageMatchingPrimaryPart) {
            best = firstLanguageMatchingPrimaryPart;
            return true;
        }

        return false; // go on to the next choice in the ordered list
    });

    return best;
}

// this is BCP 47
// Enhance: the browser actually provides an ordered list of preferences. So then
// someone who would like Portuguese but can settle for Spanish could get that.
export function getListOfPreferredLanguages(): readonly string[] {
    return navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language] ?? ["en"];
}
