import React from "react";
import { ICountryGridRowData } from "./CountryGridColumns";
export interface ICountryGridControlProps {
    setExportColumnInfo?: (
        columnNamesInDisplayOrder: string[],
        hiddenColumns: string[]
    ) => void;
    setExportData?: (data: ICountryGridRowData[]) => void;
}

// This is wrapped so that we can keep all the javascript involved in the grid
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const CountryGridControl: React.FunctionComponent<ICountryGridControlProps> = (
    props
) => {
    const CountryGridControlInternal = React.lazy(
        () =>
            import(
                /* webpackChunkName: "countryGridControlInternal" */ "./CountryGridControlInternal"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading Country Grid...</div>}>
            <CountryGridControlInternal {...props} />
        </React.Suspense>
    );
};
