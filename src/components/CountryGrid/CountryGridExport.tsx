import { exportCsv } from "../../export/exportData";
import { ICountryGridRowData } from "./CountryGridColumns";

let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_countryGridRowData: ICountryGridRowData[];

export function setCountryGridExportData(data: ICountryGridRowData[]): void {
    static_countryGridRowData = data;
}

export function setCountryGridExportColumnInfo(
    columnsInOrder: string[],
    hiddenColumns: string[]
) {
    static_columnsInOrder = columnsInOrder;
    static_hiddenColumns = hiddenColumns;
}

export function exportCountryGridDataCsv(): void {
    if (!static_countryGridRowData || !static_countryGridRowData.length) return;
    if (!static_columnsInOrder || !static_columnsInOrder.length) return;
    exportCsv("Country Grid", exportData);
}

function exportData(): string[][] {
    const all: string[][] = [];
    if (!static_countryGridRowData || !static_countryGridRowData.length)
        return all;
    const headerRow = static_columnsInOrder.filter(
        (item) => !static_hiddenColumns.includes(item)
    );
    all.push(headerRow);

    static_countryGridRowData.forEach((lang) => {
        const valueRow = headerRow.map((key) => getStringForItem(lang, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(lang: ICountryGridRowData, key: string): string {
    switch (key) {
        case "name":
            return lang.name;
        case "code":
            return lang.code;
        case "bookCount":
            return lang.bookCount.toString();
        case "knownLanguageCount":
            return lang.knownLanguageCount.toString();
        case "blorgLanguageCount":
            return lang.blorgLanguageCount.toString();
        case "blorgLanguageTags":
            return lang.blorgLanguageTags.join("; ");
        default:
            return "";
    }
}
