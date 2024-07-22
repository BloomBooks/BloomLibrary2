import { exportCsv } from "../../export/exportData";
import { ILanguageGridRowData } from "./LanguageGridColumns";

let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_languageUsageData: ILanguageGridRowData[];

export function setLanguageUsageExportData(data: ILanguageGridRowData[]): void {
    static_languageUsageData = data;
}

export function setLanguageGridExportColumnInfo(
    columnsInOrder: string[],
    hiddenColumns: string[]
) {
    static_columnsInOrder = columnsInOrder;
    static_hiddenColumns = hiddenColumns;
}

export function exportLanguageGridDataCsv(): void {
    if (!static_languageUsageData || !static_languageUsageData.length) return;
    if (!static_columnsInOrder || !static_columnsInOrder.length) return;
    exportCsv("Language Grid", exportData);
}

function exportData(): string[][] {
    const all: string[][] = [];
    if (!static_languageUsageData || !static_languageUsageData.length)
        return all;
    const headerRow = static_columnsInOrder.filter(
        (item) => !static_hiddenColumns.includes(item)
    );
    all.push(headerRow);

    static_languageUsageData.forEach((lang) => {
        const valueRow = headerRow.map((key) => getStringForItem(lang, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(lang: ILanguageGridRowData, key: string): string {
    switch (key) {
        case "exonym":
            return lang.exonym;
        case "endonym":
            return lang.endonym;
        case "otherNames":
            return lang.otherNames.join(", ");
        case "langTag":
            return lang.langTag;
        case "firstSeen":
            return lang.firstSeen.substring(0, 10);
        case "bookCount":
            return lang.bookCount.toString();
        case "level1Count":
            return lang.level1Count.toString();
        case "level2Count":
            return lang.level2Count.toString();
        case "level3Count":
            return lang.level3Count.toString();
        case "level4Count":
            return lang.level4Count.toString();
        case "uploaderCount":
            return lang.uploaderCount.toString();
        case "uploaderEmails":
            return lang.uploaderEmails.join(", ");
        case "countryName":
            return lang.countryName;
        default:
            return "";
    }
}
