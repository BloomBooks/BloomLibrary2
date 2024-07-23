import React from "react";
import { ILanguageGridRowData } from "./LanguageGridColumns";
export interface ILanguageGridControlProps {
    setExportColumnInfo?: (
        columnNamesInDisplayOrder: string[],
        hiddenColumns: string[]
    ) => void;
    setExportData?: (data: ILanguageGridRowData[]) => void;
}

// This is wrapped so that we can keep all the javascript involved in the grid
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const LanguageGridControl: React.FunctionComponent<ILanguageGridControlProps> = (
    props
) => {
    const LanguageGridControlInternal = React.lazy(
        () =>
            import(
                /* webpackChunkName: "languageGridControlInternal" */ "./LanguageGridControlInternal"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading Language Grid...</div>}>
            <LanguageGridControlInternal {...props} />
        </React.Suspense>
    );
};
