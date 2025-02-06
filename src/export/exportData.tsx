import { useEffect } from "react";
import { saveAs } from "file-saver";

// Tables and charts call this to provide a function that the parent screen can call in order
// to export the data that is in the chart.
export function useProvideDataForExport(
    rows: object[] | undefined, // undefined if data not available
    props: any
) {
    const { screenTitleRef, ...propsToWatch } = props;

    useEffect(() => {
        // getting an undefined rows collection indicates we don't have a query result yet.
        // (possibly after starting a new axios call after changing params)
        // Indicate that to the caller by passing waiting true.
        if (!rows) props.registerExportDataFn(undefined, true);
        else if (rows.length < 1) {
            // We have no data, so can't export. But we aren't waiting any more;
            // there is no data because the query found nothing.
            props.registerExportDataFn(undefined, false);
        } else {
            // We have data, and this is how we can export it.
            props.registerExportDataFn(() => {
                const headerRow = Object.keys(rows[0]);
                const all: string[][] = [];
                all.push(headerRow);

                rows.forEach((row) => {
                    const valueRow = Object.values(row).map((v) =>
                        v ? v.toString() : ""
                    ) as string[];
                    all.push(valueRow);
                });
                return all;
            }, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        !!rows /*regenerate when we get stats*/,
        rows?.length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(
            propsToWatch
        ) /* regenerate when we get different props*/,
    ]);
}

export function exportCsv(name: string, exportDataFn: ExportDataFn) {
    const csv = exportDataFn()!
        .map((columnsOfOneRow) => {
            return columnsOfOneRow.map((c) => csvEncode(c)).join(",");
        })
        .join("\n");
    saveAs(
        new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8",
        }),
        name + ".csv"
    );
}

function csvEncode(value: string): string {
    if (!value) return "";

    let needsQuotes = false;
    needsQuotes = value.indexOf(",") > -1 || value.startsWith("=HYPERLINK(");

    // escape newline characters
    value = value.replace(/\n/g, "\\n").replace(/\r/g, "\\r");

    // the rfc spec seems astonishingly inconsistent on the question of
    // whether quotes should be escaped if the entire field is not surrounded in quotes

    value = value.replace(/"/g, '""');

    if (needsQuotes) {
        // If double-quotes are used to enclose fields, then a double-quote
        // appearing inside a field must be escaped by preceding it with
        //  another double quote.
        //value = value.replace(/"/g, '""');
        return '"' + value + '"';
    }
    return value;
}

export type ExportDataFn = () => string[][];
