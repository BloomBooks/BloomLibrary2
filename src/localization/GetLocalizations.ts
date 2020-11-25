import useAxios from "@use-hooks/axios";
import { useMemo, useState } from "react";
import { setUserInterfaceTag } from "../model/Language";
import files from "./crowdin-file-names.json";

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
    explicitLanguageSetting: string // BCP 47
): ILocalizations {
    const [translationFiles] = useState<IFilenamesToL10nJson>({});

    const userInterfaceLanguageTag = useMemo<string>(() => {
        return chooseLanguageWeAreGoingToAskFor(
            explicitLanguageSetting || "en"
        );
    }, [explicitLanguageSetting]);

    setUserInterfaceTag(userInterfaceLanguageTag);

    for (const filename of files) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { response: jsonResponse } = useAxios({
            url: `translations/${userInterfaceLanguageTag}/BloomLibrary.org/${encodeURIComponent(
                filename
            )}`,
            method: "GET",
            trigger: "true",
        });
        const translationsJson: any =
            jsonResponse && jsonResponse["data"] ? jsonResponse["data"] : "";
        if (translationsJson && !translationFiles[filename]) {
            translationFiles[filename] = getJsonLocalizations(translationsJson);
        }
    }

    let translations: IStringMap = {};
    for (const filename of files) {
        translations = { ...translations, ...translationFiles[filename] };
    }
    return {
        closestLanguage: userInterfaceLanguageTag,
        stringsForThisLanguage: translations,
    };
}

// Here we are transforming "Chrome JSON" format into the key:value format expected by our L10n framework
// Note that if we did this in crowdin-sync instead, we could avoid the cost of transporting any descriptions, which are unused at runtime.
function getJsonLocalizations(json: any): IStringMap {
    const translations: IStringMap = {};
    Object.keys(json).forEach((k) => {
        translations[k] = json[k].message;
    });
    return translations;
}

function chooseLanguageWeAreGoingToAskFor(
    preferredLanguageTag: string
    // we have others, but these are ones that we know we have and that dialects need to map to
): string {
    // NB: in order to support a dialect e.g. pt-BR (Brazilian Portuguese), we would *have* to list it here. Otherwise they'll get raw "pt".
    const languagesWeKnowWeHave = ["en", "es-ES", "pt", "zh-CN", "fr"];

    if (languagesWeKnowWeHave.includes(preferredLanguageTag)) {
        return preferredLanguageTag;
    }
    // strip off the region part of the tag, and see if we have a match for the primary part
    const primary = preferredLanguageTag.split("-")[0];

    // FIRST: exact match
    if (languagesWeKnowWeHave.includes(primary)) {
        return primary;
    }

    // SECOND: match language but no dialect (Primary part of the BCP47 code). If someone wants Portuguese from Brazil, and we just have pt-PT, we should give them that.
    // Note, this heuristic could be wrong. It could be that we shouldn't try and be smart, we should just trust that the user would explicitly tell his browser
    // that, for example, he'd like pt-BR but if that's not available, he wants pt-PT.
    const firstLanguageMatchingPrimaryPart = languagesWeKnowWeHave.find(
        (l) => l.split("-")[0] === primary
    );
    if (firstLanguageMatchingPrimaryPart) {
        return firstLanguageMatchingPrimaryPart;
    }

    return preferredLanguageTag;
}

// // this is BCP 47
// // Enhance: the browser actually provides an ordered list of preferences. So then
// // someone who would like Portuguese but can settle for Spanish could get that.
// export function getListOfPreferredLanguages(): readonly string[] {
//     return navigator.languages && navigator.languages.length
//         ? navigator.languages
//         : [navigator.language] ?? ["en"];
// }
