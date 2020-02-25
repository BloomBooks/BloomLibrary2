export interface ILanguage {
    name: string;
    isoCode: string;
    usageCount: number;
    englishName?: string;
    bannerImageUrl?: string;
}

export function getLanguageNames(
    language: ILanguage
): { displayName: string; autonym: string | undefined } {
    let displayName: string;
    let autonym: string | undefined;
    if (language.englishName && language.englishName !== language.name) {
        autonym = language.name;
        displayName = language.englishName;
    } else {
        displayName = language.name;
    }
    return { displayName, autonym };
}

export function getCleanedAndOrderedLanguageList(
    languages: ILanguage[]
): ILanguage[] {
    const distinctCodeToCountMap: Map<string, number> = new Map<
        string,
        number
    >();
    const codeToNameMap: Map<string, string> = new Map<string, string>();
    const codeToEnglishNameMap: Map<string, string | undefined> = new Map<
        string,
        string | undefined
    >();
    languages.forEach((languageResult: ILanguage) => {
        const languageCode = languageResult.isoCode;
        if (!distinctCodeToCountMap.has(languageCode)) {
            distinctCodeToCountMap.set(languageCode, languageResult.usageCount);

            // For now, use the name of the one with the most books
            codeToNameMap.set(languageCode, languageResult.name);
            codeToEnglishNameMap.set(languageCode, languageResult.englishName);
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
                name: codeToNameMap.get(languageCode)!,
                englishName: codeToEnglishNameMap.get(languageCode),
                isoCode: languageCode,
                usageCount
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
