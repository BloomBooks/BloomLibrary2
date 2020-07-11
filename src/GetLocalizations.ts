import useAxios from "@use-hooks/axios";
import { useMemo } from "react";
const parsecsv = require("csv-parse/lib/sync");

interface IStringMap {
    [id: string]: string;
}

export function useGetLocalizations(
    locale: string
): { closestLocale: string; stringsForThisLocale: any } {
    const { response } = useAxios({
        url: "/Bloom Library strings.csv",
        method: "GET",
        trigger: locale,
    });
    const answer: {
        closestLocale: string;
        stringsForThisLocale: any;
    } = useMemo(() => {
        const csv = response && response["data"] ? response["data"] : "";
        console.log(JSON.stringify(csv));

        if (csv) {
            const x: any[] = parsecsv(
                csv,
                //https://csv.js.org/parse/options/
                {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                    relax_column_count: true, // not sure this is needed, but it seems reasonable
                }
            );
            console.log(JSON.stringify(x));
            const y: IStringMap = {};
            const closestLocale = getBestCodeForLocale(locale, x);
            x.forEach((row: any) => {
                y[row.Id] = row[closestLocale];
            });
            console.log("***");
            console.log(JSON.stringify(y));
            return { closestLocale, stringsForThisLocale: y };
        }

        return { closestLocale: locale, stringsForThisLocale: [] };
    }, [response, locale]);

    return answer;
}

function getBestCodeForLocale(locale: string, rows: any[]): string {
    if (rows.length === 0) return "error";
    const exampleRow = rows[0];
    if (exampleRow[locale]) {
        return locale;
    }
    let primary = locale.split("-")[0];
    if (primary === "en") {
        primary = "Source";
    }
    if (exampleRow[primary]) {
        return primary;
    }
    // TODO: if someone wants Portuguese from Brazil, and we just have pt-PT, we should give them that
    // couldn't find it
    return locale;
}
