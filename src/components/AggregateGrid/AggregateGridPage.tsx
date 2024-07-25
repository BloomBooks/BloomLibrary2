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
import { useGetDataForAggregateGrid } from "../../connection/LibraryQueryHooks";
import { IMinimalBookInfo, ILangTagData } from "./AggregateGridInterfaces";
import { observer } from "mobx-react-lite";
import { useGetLoggedInUser, User } from "../../connection/LoggedInUser";
import {
    Plugin,
    Template,
    TemplatePlaceholder,
} from "@devexpress/dx-react-core";
import { Theme } from "@material-ui/core";

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

// we need the observer in order to get the logged in user, which may not be immediately available
// we require the user to be logged in to see any of these grids.
export const AggregateGridPage: React.FunctionComponent<{
    type: "language" | "country" | "uploader";
}> = observer((props) => {
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

    CachedBookData.minimalBookInfo = useGetDataForAggregateGrid();

    const l10n = useIntl();

    const resultData = CachedBookData.minimalBookInfo.length
        ? {
              minimalBookInfo: CachedBookData.minimalBookInfo,
          }
        : loadingResult;
    const user = useGetLoggedInUser();
    if (!user) {
        return <div>You must log in to see this page.</div>;
    }
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
});

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

export function getCountryIdMapFromLangTagData(
    langTagData: ILangTagData[]
): Map<string, string> {
    const countryIdMap = new Map<string, string>();
    langTagData.forEach((lng) => {
        if (lng.region && lng.regionname) {
            countryIdMap.set(lng.region, lng.regionname);
        }
    });
    return countryIdMap;
}
export function fixLangTagRegionDataAndGetMap(
    rawLangTagData: ILangTagData[]
): Map<string, ILangTagData> {
    const map = new Map<string, ILangTagData>();
    rawLangTagData.forEach((lng) => {
        map.set(lng.tag, lng);
        // Override some primary region settings that seem misguided.
        if (lng.tag === "en") {
            lng.region = "GB"; // English originated in Great Britain, not the US.
        } else if (lng.tag === "pt") {
            lng.region = "PT"; // Portuguese originated in Portugal, not Brazil.
        }
    });
    // // Restrict the regions for some major languages to the most common ones.
    // // REVIEW: are these copilot suggestions good enough?
    // const english = map.get("en");
    // if (english)
    //     english.regions = ["US", "GB", "CA", "AU", "NZ", "IE", "ZA", "IN"];
    // const spanish = map.get("es");
    // if (spanish) spanish.regions = ["MX", "US", "ES", "AR", "CO", "PE"];
    // const french = map.get("fr");
    // if (french) french.regions = ["FR", "CA", "BE", "CH"];
    // const german = map.get("de");
    // if (german) german.regions = ["DE", "AT", "CH"];
    // const portuguese = map.get("pt");
    // if (portuguese) portuguese.regions = ["PT", "BR"];
    // const chinese = map.get("zh");
    // if (chinese) chinese.regions = ["CN", "TW", "HK", "SG"];
    // const arabic = map.get("ar");
    // if (arabic) arabic.regions = ["EG", "SA", "DZ", "MA", "SD", "IQ"];
    // const russian = map.get("ru");
    // if (russian) russian.regions = ["RU", "UA", "KZ", "BY"];
    // const japanese = map.get("ja");
    // if (japanese) japanese.regions = ["JP"];
    // const korean = map.get("ko");
    // if (korean) korean.regions = ["KR"];

    return map;
}

export function getLangTagDataForIrregularLangCode(
    code: string,
    langDataMap: Map<string, ILangTagData>,
    countryIdMap: Map<string, string>
): ILangTagData | undefined {
    const langTagData = {} as ILangTagData;
    const codeSections = code.split("-x-");
    const tagPieces = codeSections[0].split("-");
    langTagData.tag = code;
    if (tagPieces.length > 1) {
        const reg = tagPieces.find((piece) => {
            return /[A-Z]{2}/.test(piece);
        });
        if (reg) {
            langTagData.region = reg;
            langTagData.regionname = countryIdMap.get(reg) || reg;
        }
    }
    if (codeSections.length > 1) {
        langTagData.name = codeSections[1];
    }
    // replace obsolete codes with current ones.
    // or possibly specific with generic due to general confusion
    let newCode = tagPieces[0];
    switch (newCode) {
        // swh / Swahili (Tanzania) shares the macrolanguage code sw with swc / Swahili (Congo)
        case "swh":
            newCode = "sw";
            break;
        // kmr / Northern Kurdish shares the macrolanguage code ku with ckb / Central Kurdish and sdh / Southern Kurdish
        case "kmr":
            newCode = "ku";
            break;
        // obsolete code for Southern Balochi
        case "bcc":
            newCode = "bal";
            break;
        // obsolete code for Luyia, sometimes called Bukusu
        case "bxk":
            newCode = "luy";
            break;
        // obsolete code for Cusco Quechua
        // que / (Cuzco) Quechua shares the macrolanguage code qu with qub, qud, quf, quk, qul, qup, qur, qus, and many more
        case "quz":
            newCode = "qu";
            break;
        // obsolete code for Marwari, sometimes called Dhundari
        case "dhd":
            newCode = "mwr";
            break;
        // obsolete code for Eastern Yiddish
        // yid / (Eastern) Yiddish shares the macrolanguage code yi with yih / Western Yiddish
        case "ydd":
            newCode = "yi";
            break;
        // obsolete code for Malay
        // zsm / Malay shares the macrolanguage code ms with bjn, btj, bve, bvu, coa, dup, hji, id (!), jak, jax, and many more
        case "zsm":
            newCode = "ms";
            break;
    }
    const tagData = langDataMap.get(newCode);
    if (tagData) {
        if (!langTagData.name) langTagData.name = tagData.name;
        if (!langTagData.region) {
            langTagData.region = tagData.region;
            langTagData.regionname = tagData.regionname;
        }
    }
    return langTagData;
}

export const ModeratorStatusToolbarPlugin = (
    theme: Theme,
    user: User | undefined
) => (
    <Plugin name="ShowModeratorStatus">
        <Template name="toolbarContent">
            <span
                css={css`
                    margin-left: 20px;
                    margin-right: 5px;
                    color: ${theme.palette.primary.main};
                `}
            >
                {user && `${user.moderator ? "Moderator" : ""}`}
            </span>
            <TemplatePlaceholder />
        </Template>
    </Plugin>
);
