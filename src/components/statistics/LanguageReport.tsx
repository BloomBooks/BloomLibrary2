import React, { useEffect } from "react";
import FileSaver from "file-saver";
import { useGetCleanedAndOrderedLanguageList } from "../../connection/LibraryQueryHooks";
import { ILanguage } from "../../model/Language";

export const LanguageReport: React.FunctionComponent<{}> = (props) => {
    const langs = useGetCleanedAndOrderedLanguageList();

    useEffect(() => {
        if (langs && langs.length > 0) {
            const langRows = langs.map(
                (l: ILanguage) =>
                    `${l.isoCode},"${l.name}","${l.englishName || ""}",${
                        l.usageCount
                    }`
            );
            const rows = ["TAG,AUTONYM,ENGLISH,BOOK COUNT", ...langRows];
            const csv = rows.join("\n");
            const blob = new Blob(["\ufeff" /* BOM */ + csv], {
                type: "text/csv;charset=utf-8",
            });
            FileSaver.saveAs(blob, "bloom-languages.csv");
        }
    }, [langs]);
    return <div>Building and downloading language report.</div>;
};
