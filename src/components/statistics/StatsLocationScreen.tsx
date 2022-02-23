// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useMemo, useState } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useProvideDataForExport } from "../../export/exportData";
import {
    ICityStat,
    ICountryStat,
    useGetLocationStats,
} from "./useGetLocationStats";
import { ResponsiveChoropleth } from "@nivo/geo";
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
import { StatsGridWrapper } from "./StatsGridWrapper";
import { FormControl, MenuItem, Select } from "@material-ui/core";
const countryShapes = require("./world_countries.json");
const countryIds = require("./country_ids.json");

export const StatsLocationScreen: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const [view, setView] = useState("countryMap");
    const stats = useGetLocationStats(
        props,
        ["countryTable", "countryMap"].includes(view)
    );
    useProvideDataForExport(stats ? stats : undefined, props);

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
                    <MenuItem value="countryMap">Country Map</MenuItem>
                    <MenuItem value="countryTable">Table by Country</MenuItem>
                    <MenuItem value="cityTable">Table by City</MenuItem>
                </Select>
            </FormControl>
            {view === "countryMap" && (
                <StatsLocationMap stats={stats} view={view} />
            )}
            {(view === "countryTable" || view === "cityTable") && (
                <StatsLocationTable stats={stats} view={view} />
            )}
        </>
    );
};
const StatsLocationMap: React.FunctionComponent<{
    stats: ICityStat[] | ICountryStat[] | undefined;
    view: string;
}> = (props) => {
    const countryStats = props.stats as ICountryStat[];

    // Our database doesn't currently give us country ids, so we do a lookup.
    // Enhance: probably that DB has this info, we should include it in the stats so we can put it in the CSV export
    // Enhance: or just move this lookup to to the fn that gets the data, so it will be in the CSV export
    const data =
        useMemo(() => {
            if (!props.stats) return { countries: [], maxReads: 0 };
            let maxReads = 0;
            const x = countryStats?.map((e) => {
                const c = countryIds.find((c: any) => c.name === e.country);
                if (!c) {
                    console.warn(`Unknown Country: ${e.country}`);
                    return null;
                }
                maxReads = Math.max(maxReads, e.reads || 0);
                return {
                    id: c.alpha3.toUpperCase(),
                    value: e.reads,
                };
            });
            return { countries: x, maxReads: maxReads };
        }, [countryStats, props.stats]) || [];

    console.log("maxreads: ", data.maxReads);
    return (
        <div
            css={css`
                height: 500px;
                width: 800px;
            `}
        >
            <ResponsiveChoropleth
                //features="/* please have a look at the description for usage */"
                features={countryShapes.features}
                data={data.countries}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                colors="nivo"
                domain={[0, data.maxReads]}
                unknownColor="#666666"
                label="properties.name"
                valueFormat=","
                projectionTranslation={[0.5, 0.5]}
                projectionRotation={[0, 0, 0]}
                graticuleLineColor="#dddddd"
                borderWidth={0.5}
                borderColor="#152538"
                isInteractive={true}
                // tooltip={(props) => (
                //     <div
                //         css={css`
                //             background-color: white;
                //             border: solid black;
                //             padding: 20px;
                //         `}
                //     >
                //         {`${props.feature.label}:${props.feature.value}`}
                //     </div>
                // )}
            />
        </div>
    );
};

const StatsLocationTable: React.FunctionComponent<{
    stats: ICityStat[] | ICountryStat[] | undefined;
    view: string;
}> = (props) => {
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
        <StatsGridWrapper stats={props.stats}>
            <Grid
                rows={props.stats!}
                columns={
                    props.view === "countryTable"
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
                <TableSummaryRow
                    messages={{
                        count:
                            props.view === "countryTable"
                                ? "Number of Countries"
                                : "Number of Cities",
                    }}
                />
            </Grid>
        </StatsGridWrapper>
    );
};
