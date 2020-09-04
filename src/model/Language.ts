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
          displayName: string;
          autonym: string | undefined;
          displayNameWithAutonym: string;
      }
    | undefined {
    const language = languages.find((l) => l.isoCode === languageCode);
    if (language) return getDisplayNamesForLanguage(language);
    return undefined;
}

export function getDisplayNamesForLanguage(
    language: ILanguage
): {
    displayName: string;
    autonym: string | undefined;
    displayNameWithAutonym: string;
} {
    let displayName: string;
    let autonym: string | undefined;
    let displayNameWithAutonym: string;
    if (language.englishName && language.englishName !== language.name) {
        autonym = language.name;
        displayName = language.englishName;
        displayNameWithAutonym = `${autonym} (${displayName})`;
    } else {
        displayName = language.name;
        displayNameWithAutonym = displayName;
    }
    return { displayName, autonym, displayNameWithAutonym };
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
