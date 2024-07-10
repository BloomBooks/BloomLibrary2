import { exportCsv } from "../../export/exportData";
import { IUploaderGridData } from "./UploaderGridColumns";

let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_uploaderData: IUploaderGridData[];

export function setUploaderUsageExportData(data: IUploaderGridData[]): void {
    static_uploaderData = data;
}

export function setUploaderGridExportColumnInfo(
    columnsInOrder: string[],
    hiddenColumns: string[]
) {
    static_columnsInOrder = columnsInOrder;
    static_hiddenColumns = hiddenColumns;
}

export function exportUploaderGridDataCsv(): void {
    if (!static_uploaderData || !static_uploaderData.length) return;
    if (!static_columnsInOrder || !static_columnsInOrder.length) return;
    exportCsv("Uploader Grid", exportData);
}

function exportData(): string[][] {
    const all: string[][] = [];
    if (!static_uploaderData || !static_uploaderData.length) return all;
    const headerRow = static_columnsInOrder.filter(
        (item) => !static_hiddenColumns.includes(item)
    );
    all.push(headerRow);

    static_uploaderData.forEach((lang) => {
        const valueRow = headerRow.map((key) => getStringForItem(lang, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(uploader: IUploaderGridData, key: string): string {
    switch (key) {
        case "email":
            return uploader.email;
        case "bookCount":
            return uploader.bookCount.toString();
        case "languages":
            return uploader.languages.join("; ");
        case "countryNames":
            return uploader.countryNames.join("; ");
        case "creationDate":
            return uploader.creationDate.substring(0, 10);
        case "organization":
            return uploader.organization ?? "";
        case "firstUploadDate":
            return uploader.firstUploadDate ?? "";
        case "latestUploadDate":
            return uploader.latestUploadDate ?? "";
        default:
            return "";
    }
}
