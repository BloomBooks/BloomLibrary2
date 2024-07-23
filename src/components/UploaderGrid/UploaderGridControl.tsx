import React from "react";
import { IUploaderGridData } from "./UploaderGridColumns";
export interface IUploaderGridControlProps {
    setExportColumnInfo?: (
        columnNamesInDisplayOrder: string[],
        hiddenColumns: string[]
    ) => void;
    setExportData?: (data: IUploaderGridData[]) => void;
}

// This is wrapped so that we can keep all the javascript involved in the grid
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const UploaderGridControl: React.FunctionComponent<IUploaderGridControlProps> = (
    props
) => {
    const UploaderGridControlInternal = React.lazy(
        () =>
            import(
                /* webpackChunkName: "uploaderGridControlInternal" */ "./UploaderGridControlInternal"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading Uploader Grid...</div>}>
            <UploaderGridControlInternal {...props} />
        </React.Suspense>
    );
};
