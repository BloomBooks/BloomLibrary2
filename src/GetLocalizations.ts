import useAxios from "@use-hooks/axios";
import { useMemo } from "react";
import * as voca from "voca";
const parsecsv = require("csv-parse/lib/sync");

interface IStringMap {
    [id: string]: string;
}
interface IAnswer {
    closestLanguage: string;
    stringsForThisLanguage: any;
}

export function useGetLocalizations(
    // explicitLanguageSetting is a language that the user has selected with our UI (not the browser's).
    // If it is undefined  (this would be the normal case) or if we can't provide it for some reason we'll go and look at their browser languages.
    explicitLanguageSetting: string | undefined // BCP 47
): IAnswer {
    const { response } = useAxios({
        url: "/Bloom Library Strings.csv",
        method: "GET",
        trigger: "true",
    });

    const answer: IAnswer = useMemo<IAnswer>(() => {
        const csv: string =
            response && response["data"] ? response["data"] : "";

        if (csv) {
            const firstLine = csv.match(/^.*$/m)![0];
            const languagesInCrowdin = firstLine
                .split(",")
                .map((c) => voca.trim(c, '" '));
            // remove first two columns, which are ID and Description
            languagesInCrowdin.splice(0, 2);
            const allStringRows: any[] = parsecsv(
                csv,
                //https://csv.js.org/parse/options/
                {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                    relax_column_count: true, // not sure this is needed, but it seems reasonable
                }
            );
            const mappingForOneLanguage: IStringMap = {};
            const closestLanguage = chooseClosestLanguageWeActuallyHave(
                explicitLanguageSetting,
                languagesInCrowdin
            );
            const columnKey =
                closestLanguage === "en"
                    ? "Source" // the "Source" column is what holds the English
                    : closestLanguage;

            allStringRows.forEach(
                (allTranslationsOfOneStringAsAnObject: any) => {
                    // Enhance: If we wanted to be able to have untranslated strings fallback to something other than English (),
                    // we would need to do the fall back here.
                    mappingForOneLanguage[
                        allTranslationsOfOneStringAsAnObject.Id
                    ] =
                        // Uncomment the next line for testing. Each translated string will be prefixed by *_
                        //(columnKey !== "en" ? "*_" : "") +
                        // *** Do not commit the above line uncommented ***
                        allTranslationsOfOneStringAsAnObject[
                            columnKey
                        ] /* the same as allTranslationsOfOneStringAsAnObject.es or allTranslationsOfOneStringAsAnObject.fr */;
                }
            );
            return {
                closestLanguage,
                stringsForThisLanguage: mappingForOneLanguage,
            };
        }

        // no csv available
        return {
            closestLanguage: "en",
            // tslint:disable-next-line: no-object-literal-type-assertion
            stringsForThisLanguage: {} as IStringMap,
        };
    }, [response, explicitLanguageSetting]);

    return answer;
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
