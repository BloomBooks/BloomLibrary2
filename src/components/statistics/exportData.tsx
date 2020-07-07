import { useEffect } from "react";
import { ExportDataFn } from "./StatsInterfaces";

// Tables and charts call this to provide a function that the parent screen can call in order
// to export the data that is in the chart.
export function useProvideDataForExport(
    rows: object[] | undefined,
    props: any
) {
    useEffect(() => {
        // clear out any previous fn until we get data
        if (!rows || rows.length < 1) props.registerExportDataFn(undefined);
        else
            props.registerExportDataFn(() => {
                const headerRow = Object.keys(rows[0]);
                const all: string[][] = [];
                all.push(headerRow);

                rows.forEach((row) => {
                    const valueRow = Object.values(row).map((v) =>
                        v.toString()
                    ) as string[];
                    all.push(valueRow);
                });
                return all;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        !!rows /*regenerate when we get stats*/,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        rows?.length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(props) /* regenerate when we get different props*/,
    ]);
}

export function exportCsv(name: string, exportDataFn: ExportDataFn) {
    const csv = exportDataFn()!
        .map((columnsOfOneRow) => {
            return columnsOfOneRow.map((c) => csvEncode(c)).join(", ");
        })
        .join("\n");
    saveAs(
        new Blob([csv], {
            type: "text/csv;charset=utf-8",
        }),
        name + ".csv"
    );
}

function csvEncode(value: string): string {
    let needsQuotes = false;
    needsQuotes = value.indexOf(",") > -1;

    // mac,linux, windows all have an \r, so that's
    // enough, even though windows also has \n.
    needsQuotes = needsQuotes || value.indexOf("\r") > -1;

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
