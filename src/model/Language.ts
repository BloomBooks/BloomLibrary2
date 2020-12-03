export interface ILanguage {
    name: string;
    isoCode: string;
    usageCount: number;
    englishName?: string;
    bannerImageUrl?: string;
    objectId: string;
}

export function getDisplayNamesFromLanguageCode(
    languageCode: string,
    languages: ILanguage[]
):
    | {
          primary: string;
          secondary: string | undefined;
          combined: string;
      }
    | undefined {
    const language = languages.find((l) => l.isoCode === languageCode);
    if (language) return getDisplayNamesForLanguage(language);
    return undefined;
}

//  it's tempting to use navigator.language, but we also want to support other ways of choosing the current UI language
// This is essentially a global (accessed via a setter function) because it's not worth it to me to do a tone of plumbing.
let userInterfaceTagWeAreUsing: string = "en";
export function setUserInterfaceTag(tag: string) {
    userInterfaceTagWeAreUsing = tag;
}
export function getDisplayNamesForLanguage(
    language: ILanguage
): {
    primary: string;
    secondary: string | undefined;
    combined: string;
} {
    // don't bother showing "zh-CN"... it's not a variant, it's the norm
    if (language.isoCode === "zh-CN") {
        return navigator.language === "zh-CN"
            ? {
                  secondary: "Chinese",
                  primary: "简体中文",
                  combined: "简体中文 (Chinese)",
              }
            : {
                  primary: "Chinese",
                  secondary: "简体中文",
                  combined: "Chinese (简体中文)",
              };
    }
    let primary: string;
    let secondary: string | undefined;

    // the browser/crowdin language may be overly specific. E.g. "es-ES" --> "es"
    const uilang = userInterfaceTagWeAreUsing.split("-")[0];

    if (language.englishName && language.englishName !== language.name) {
        if (uilang === language.isoCode) {
            primary = language.name;
            secondary = language.englishName;
        } else {
            primary = language.englishName;
            secondary = language.name;
        }
    } else {
        primary = language.name;
    }
    // if it looks like this is a variant, add that to the secondary

    if (
        language.isoCode &&
        language.isoCode.indexOf("-") > -1 &&
        language.isoCode !== language.englishName &&
        language.isoCode !== language.name
    )
        secondary = [secondary, language.isoCode].join(" ");

    const combined = primary + (secondary ? `(${secondary})` : "");

    return { primary, secondary, combined };
}

export function getCleanedAndOrderedLanguageList(
    languages: ILanguage[]
): ILanguage[] {
    const distinctCodeToCountMap: Map<string, number> = new Map<
        string,
        number
    >();
    const codeToLanguageMap = new Map<string, ILanguage>();
    languages.forEach((languageResult: ILanguage) => {
        const languageCode = languageResult.isoCode;
        if (!distinctCodeToCountMap.has(languageCode)) {
            distinctCodeToCountMap.set(languageCode, languageResult.usageCount);

            // For now, use the name of the one with the most books
            codeToLanguageMap.set(languageCode, languageResult);
        } else {
            const sumSoFar = distinctCodeToCountMap.get(languageCode)!;
            distinctCodeToCountMap.set(
                languageCode,
                sumSoFar + languageResult.usageCount
            );
        }
    });

    const sanitizedResults: ILanguage[] = Array.from(
        distinctCodeToCountMap,
        ([languageCode, usageCount]) => {
            return {
                name: codeToLanguageMap.get(languageCode)!.name,
                englishName: codeToLanguageMap.get(languageCode)?.englishName,
                isoCode: languageCode,
                usageCount,
                objectId: codeToLanguageMap.get(languageCode)!.objectId,
            };
        }
    );

    sanitizedResults.sort(SortByUsageCount);
    return sanitizedResults;
}

function SortByUsageCount(x: ILanguage, y: ILanguage) {
    return x.usageCount > y.usageCount
        ? -1
        : x.usageCount < y.usageCount
        ? 1
        : x.name.localeCompare(y.name);
}
