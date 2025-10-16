import React from "react";
import { IFilter } from "FilterTypes";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";
export interface IGridControlProps {
    showFilterSpec?: boolean;
    setCurrentFilter?: (
        completeFilter: IFilter, //includes the search box
        gridColumnFilters: GridFilter[] //just the filters from the headers of the columns
    ) => void;
    initialGridFilters?: GridFilter[];
    contextFilter?: IFilter;
    setExportData?: (
        columnNamesInDisplayOrder: string[],
        hiddenColumns: string[],
        sortingArray: Array<{ columnName: string; descending: boolean }>
    ) => void;
}

// This is wrapped so that we can keep all the javascript involved in the grid
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const GridControl: React.FunctionComponent<IGridControlProps> = (
    props
) => {
    const GridControlInternal = React.lazy(
        () =>
            import(
                /* webpackChunkName: "gridControlInternal" */ "./GridControlInternal"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading Grid...</div>}>
            <GridControlInternal {...props} />
        </React.Suspense>
    );
};
