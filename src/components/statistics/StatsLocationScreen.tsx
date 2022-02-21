// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useProvideDataForExport } from "../../export/exportData";
import { useGetLocationStats } from "./useGetLocationStats";
import {
    Grid,
    TableHeaderRow,
    Table,
    TableSummaryRow,
} from "@devexpress/dx-react-grid-material-ui";
import {
    SortingState,
    IntegratedSorting,
    SummaryState,
    IntegratedSummary,
    DataTypeProvider,
} from "@devexpress/dx-react-grid";
import { IGridColumn } from "../Grid/GridColumns";
import { StatsGridWrapper } from "./GridWrapper";
import { FormControl, MenuItem, Select } from "@material-ui/core";

export const StatsLocationScreen: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const [view, setView] = useState("countryTable");
    const stats = useGetLocationStats(props, "countryTable" === view);
    useProvideDataForExport(stats ? stats : undefined, props);

    const cityTableColumns: IGridColumn[] = [
        { name: "country", title: "Country", l10nId: "country" },
        { name: "region", title: "Region", l10nId: "region" },
        { name: "city", title: "City", l10nId: "city" },
        { name: "reads", title: "Reads", l10nId: "reads" },
    ];

    const countryTableColumns: IGridColumn[] = [
        { name: "country", title: "Country", l10nId: "country" },
        {
            name: "reads",
            title: "Reads",
            l10nId: "reads",
            //getCellValue: (row: any, columnName: string) => `${row.reads}`,
        },
    ];

    const [integratedSortingColumnExtensions] = React.useState([
        { columnName: "reads" },
    ]);

    // add commas (or whatever) to numbers
    const NumberFormatProvider = (props: any) => (
        <DataTypeProvider
            for={["reads"]}
            formatterComponent={({ value }) => (
                <div>{value.toLocaleString()}</div>
            )}
        ></DataTypeProvider>
    );

    return (
        <>
            <FormControl
                className="choice-control"
                css={css`
                    margin-bottom: 1em;
                    * {
                        font-size: 0.875rem;
                    }
                `}
            >
                <Select
                    value={view}
                    onChange={(e) => setView(e.target.value as string)}
                    autoWidth
                >
                    <MenuItem value="countryTable">Table by Country</MenuItem>
                    <MenuItem value="cityTable">Table by City</MenuItem>
                </Select>
            </FormControl>
            <StatsGridWrapper stats={stats}>
                <Grid
                    rows={stats!}
                    columns={
                        view === "countryTable"
                            ? countryTableColumns
                            : cityTableColumns
                    }
                >
                    <NumberFormatProvider />
                    <SortingState
                        defaultSorting={[
                            { columnName: "reads", direction: "desc" },
                        ]}
                    />
                    <IntegratedSorting
                        columnExtensions={integratedSortingColumnExtensions}
                    />

                    <SummaryState
                        totalItems={[{ columnName: "reads", type: "count" }]}
                    />

                    <IntegratedSummary />
                    <Table />
                    <TableHeaderRow showSortingControls />
                    <TableSummaryRow messages={{ count: "Number of Cities" }} />
                </Grid>
            </StatsGridWrapper>
        </>
    );
};
