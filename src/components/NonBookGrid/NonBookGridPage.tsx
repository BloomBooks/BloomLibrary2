// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import { LanguageGridControl } from "../LanguageGrid/LanguageGridControl";
import { CountryGridControl } from "../CountryGrid/CountryGridControl";
import { UploaderGridControl } from "../UploaderGrid/UploaderGridControl";
import { useSetBrowserTabTitle } from "../Routes";
import Button from "@material-ui/core/Button";
import { useIntl } from "react-intl";
import DownloadCsvIcon from "../../export/download-csv.svg";
import {
    setLanguageGridExportColumnInfo,
    setLanguageUsageExportData,
    exportLanguageGridDataCsv,
} from "../LanguageGrid/LanguageGridExport";
import {
    setCountryGridExportColumnInfo,
    setCountryGridExportData,
    exportCountryGridDataCsv,
} from "../CountryGrid/CountryGridExport";
import {
    setUploaderGridExportColumnInfo,
    setUploaderUsageExportData,
    exportUploaderGridDataCsv,
} from "../UploaderGrid/UploaderGridExport";
import { useGetDataForNonBookGrid } from "../../connection/LibraryQueryHooks";

export interface ILangTagData {
    tag: string;
    name: string;
    names?: string[];
    region: string;
    regionname: string;
    regions?: string[];
}
export interface ICountryIdData {
    a2: string; // 2-letter code (names match what is in the json data file)
    a3: string; // 3-letter code
    n: string; // name
}

// Basic user information used by the uploader-grid page and language-grid page.
export interface IBasicUserInfo {
    objectId: string; // needed only to ensure uniqueness in a list of users
    createdAt: string; // when the user was created/registered.
    username: string; // the user's email address, real or not.
}
export interface IMinimalBookInfo {
    objectId: string;
    createdAt: string;
    tags: string[];
    lang1Tag?: string;
    show?: { pdf: { langTag: string } }; // there is more, but this is what we're using to get at l1 at the moment
    uploader: IBasicUserInfo;
}

interface ICachedBookData {
    minimalBookInfo: IMinimalBookInfo[];
}
export const CachedBookData: ICachedBookData = {
    minimalBookInfo: [],
};
const loadingResult = {
    minimalBookInfo: [],
};

export const CachedBookDataContext = React.createContext<ICachedBookData>({
    minimalBookInfo: [],
});

export const NonBookGridPage: React.FunctionComponent<{ type: string }> = (
    props
) => {
    let title = "Language Grid";
    let exportCsvFunction = exportLanguageGridDataCsv;
    if (props.type === "country") {
        title = "Country Grid";
        exportCsvFunction = exportCountryGridDataCsv;
    } else if (props.type === "uploader") {
        title = "Uploader Grid";
        exportCsvFunction = exportUploaderGridDataCsv;
    }
    useSetBrowserTabTitle(title);

    CachedBookData.minimalBookInfo = useGetDataForNonBookGrid();

    const l10n = useIntl();

    const resultData = CachedBookData.minimalBookInfo.length
        ? {
              minimalBookInfo: CachedBookData.minimalBookInfo,
          }
        : loadingResult;

    return (
        <CachedBookDataContext.Provider value={resultData}>
            <div>
                {props.type === "language" && (
                    <LanguageGridControl
                        setExportColumnInfo={setLanguageGridExportColumnInfo}
                        setExportData={setLanguageUsageExportData}
                    />
                )}
                {props.type === "country" && (
                    <CountryGridControl
                        setExportColumnInfo={setCountryGridExportColumnInfo}
                        setExportData={setCountryGridExportData}
                    />
                )}
                {props.type === "uploader" && (
                    <UploaderGridControl
                        setExportColumnInfo={setUploaderGridExportColumnInfo}
                        setExportData={setUploaderUsageExportData}
                    />
                )}
                <div
                    css={css`
                        display: flex;
                    `}
                >
                    <Button onClick={() => exportCsvFunction()}>
                        <img
                            alt={l10n.formatMessage({
                                id: "stats.download.csvIcon",
                                defaultMessage: "download CSV",
                            })}
                            src={DownloadCsvIcon}
                        />
                    </Button>
                </div>
            </div>
        </CachedBookDataContext.Provider>
    );
};

// return an array with two elements: the operator and the value to match
// These are decoded from the filter string, with the operator being one of
// "<", ">", "<=", ">=", or "=" and the value to match being the rest of the
// string (after trimming).
export function getOperatorAndMatchValue(value: string): string[] {
    let operator = "<="; // REVIEW: is "<=" the right default?
    let matchValue = value.trim();

    if (matchValue.startsWith("<=")) {
        operator = "<=";
        matchValue = matchValue.substring(2).trim();
    } else if (matchValue.startsWith(">=")) {
        operator = ">=";
        matchValue = matchValue.substring(2).trim();
    } else if (matchValue.startsWith("<")) {
        operator = "<";
        matchValue = matchValue.substring(1).trim();
    } else if (matchValue.startsWith(">")) {
        operator = ">";
        matchValue = matchValue.substring(1).trim();
    } else if (matchValue.startsWith("=")) {
        operator = "=";
        matchValue = matchValue.substring(1).trim();
    }
    return [operator, matchValue];
}

// return false if this value should be filtered out.
// return true if this value should be included.
export function filterNumberWithOperator(
    filterValue: string,
    cellValue: number
): boolean {
    const [operator2, value2] = getOperatorAndMatchValue(filterValue);
    if (!value2 || !value2.trim()) return true; // no value to filter on
    const numValue2 = parseInt(value2, 10);
    if (isNaN(numValue2)) return true; // invalid value to filter on
    switch (operator2) {
        case "<=":
            return cellValue <= numValue2;
        case ">=":
            return cellValue >= numValue2;
        case "<":
            return cellValue < numValue2;
        case ">":
            return cellValue > numValue2;
        case "=":
            return cellValue === numValue2;
    }
    return true; // shouldn't get here, but pass the value through if we do
}

// use a leading ! to negate the match.  This character is unlikely to be
// used in names or tags, so it should be safe to use for this purpose.
export function filterStringWithNegation(
    filterValue: string,
    cellValue: string
): boolean {
    if (!filterValue || !filterValue.trim()) return true; // no value to filter on
    const filterLower = filterValue.trim().toLowerCase();
    const cellLower = cellValue.toLowerCase();
    // Enhance: allow filterValue to be a semicolon-separated list of values?
    if (filterLower.startsWith("!")) {
        // negate the match if the filter value starts with an exclamation point
        const negativeFilterValue = filterLower.substring(1).trim();
        if (
            negativeFilterValue &&
            cellLower &&
            cellLower.includes(negativeFilterValue)
        ) {
            return false;
        }
    } else if (!cellLower || !cellLower.includes(filterLower)) {
        return false;
    }
    return true;
}

export function filterSimpleString(
    filterValue: string,
    cellValue: string
): boolean {
    if (!filterValue || !filterValue.trim()) return true; // no value to filter on
    const filterLower = filterValue.trim().toLowerCase();
    const cellLower = cellValue.toLowerCase();
    if (!cellLower || !cellLower.includes(filterLower)) {
        return false;
    }
    return true;
}

export function filterDateStringWithOperator(
    filterValue: string,
    cellValue: string
): boolean {
    const [operator, filter] = getOperatorAndMatchValue(filterValue);
    if (!filter || !filter.trim()) return true; // no value to filter on
    // To get expected behavior, we have to trim the cell content to
    // the length of the filter.  Thus, if the user types in just the
    // year, we compare only the year part of the date.  If the user
    // types in the full date, we compare the full date.
    const cell = cellValue.substring(0, filter.length);
    switch (operator) {
        case "<=":
            return cell <= filter;
        case ">=":
            return cell >= filter;
        case "<":
            return cell < filter;
        case ">":
            return cell > filter;
        case "=":
            return cell === filter;
    }
    return true; // shouldn't get here, but pass the value through if we do
}
export function fixLanguageRegionDataAndGetMap(
    rawLangData: ILangTagData[]
): Map<string, ILangTagData> {
    const map = new Map<string, ILangTagData>();
    rawLangData.forEach((lng) => {
        map.set(lng.tag, lng);
    });
    // Add regions to the original language entries from the -Dupl and -Brai scripts.
    // I'm not sure what Dupl is, but Brai is Braille.  It makes sense that the Braille
    // script shouldn't be considered a separate language, and that it would used only
    // where the language is actually spoken.
    // This ensures that Spanish is known to be spoken in Mexico and the US, for example.
    // Also, that English is spoken in the UK, Australia, and Canada.
    // Other languages such as German and French also get additional regions added by this
    // processing.
    rawLangData.forEach((lng) => {
        if (lng.tag.endsWith("-Dupl") || lng.tag.endsWith("-Brai")) {
            if (lng.regions && lng.regions.length > 0) {
                const tag = lng.tag.substring(0, lng.tag.length - 5);
                const origLang = map.get(tag);
                if (!origLang) {
                    console.warn("No original lang for ", tag);
                    return;
                }
                if (!origLang.regions) {
                    origLang.regions = [];
                }
                if (!origLang.regions.includes(lng.region)) {
                    console.log(`Adding region ${lng.region} to ${tag}`);
                    origLang.regions.push(lng.region);
                }
                lng.regions.forEach((r) => {
                    if (!origLang.regions) {
                        origLang.regions = [];
                    }
                    if (!origLang.regions.includes(r)) {
                        console.log(`Adding region ${r} to ${tag}`);
                        origLang.regions.push(r);
                    }
                });
            }
        }
    });
    // Restrict the regions for some major languages to the most common ones.
    // REVIEW: are these copilot suggestions good enough?
    const english = map.get("en");
    if (english)
        english.regions = ["US", "GB", "CA", "AU", "NZ", "IE", "ZA", "IN"];
    const spanish = map.get("es");
    if (spanish) spanish.regions = ["MX", "US", "ES", "AR", "CO", "PE"];
    const french = map.get("fr");
    if (french) french.regions = ["FR", "CA", "BE", "CH"];
    const german = map.get("de");
    if (german) german.regions = ["DE", "AT", "CH"];
    const portuguese = map.get("pt");
    if (portuguese) portuguese.regions = ["PT", "BR"];
    const chinese = map.get("zh");
    if (chinese) chinese.regions = ["CN", "TW", "HK", "SG"];
    const arabic = map.get("ar");
    if (arabic) arabic.regions = ["EG", "SA", "DZ", "MA", "SD", "IQ"];
    const russian = map.get("ru");
    if (russian) russian.regions = ["RU", "UA", "KZ", "BY"];
    const japanese = map.get("ja");
    if (japanese) japanese.regions = ["JP"];
    const korean = map.get("ko");
    if (korean) korean.regions = ["KR"];

    return map;
}
