import { css } from "@emotion/react";

import React, { useMemo } from "react";
import { IStatsPageProps } from "./StatsInterfaces";
import { useProvideDataForExport } from "../../export/exportData";

import {
    ICityStat,
    ICountryStat,
    useGetLocationStats,
} from "./useGetLocationStats";
import { Choropleth } from "@nivo/geo";
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
import { getPublishableDateRangeString, IDateRange } from "./DateRangePicker";
import { useIntl } from "react-intl";

import countryShapes from "./world_countries.json";
import countryIds from "./country_ids.json";

export const StatsLocationScreen: React.FunctionComponent<
    IStatsPageProps & { view: "country-map" | "country-table" | "city-table" }
> = (props) => {
    const view = props.view;

    const stats = useGetLocationStats(
        props,
        ["country-table", "country-map"].includes(view)
    );

    useProvideDataForExport(stats ? stats : undefined, props);

    return (
        <>
            {view === "country-map" && (
                <StatsLocationMap
                    stats={stats}
                    view={view}
                    collection={props.collection.label}
                    dateRange={props.dateRange}
                />
            )}
            {(view === "country-table" || view === "city-table") && (
                <StatsLocationTable stats={stats} view={view} />
            )}
        </>
    );
};
const StatsLocationMap: React.FunctionComponent<{
    stats: ICityStat[] | ICountryStat[] | undefined;
    view: string;
    collection: string;
    dateRange: IDateRange;
}> = (props) => {
    const countryStats = props.stats as ICountryStat[];
    const l10n = useIntl();
    // This function spreads out the values to give us a better choropleth map, especially when the data has a bimodal distribution,
    // as is often the case because a set of books is primarily targeted at one country.
    const distributionFn = (n: number) => {
        return Math.log10(n);
    };
    // This function returns the original value, for use in displaying the value to the user.
    const reverseDistributionFn = (n: number) => {
        return Math.pow(10, n);
    };

    const formatter = Intl.NumberFormat(undefined /* use whatever locale */, {
        maximumFractionDigits: 0,
        notation: "compact", // does things like use "k" for thousands
        // `notation` is implemented in es2020, but I couldn't get our tsconfig and eslint to look there... was stuck on es5
        // So that's what this casting is about
    } as Intl.NumberFormatOptions);

    // Our database gives us 2 letter country ids, but the map comes with 3 letter country ids. So we do the conversion here.
    const data =
        useMemo(() => {
            if (!props.stats) return { countries: [], maxReads: 0 };
            let maxReads = 0;
            const countriesStatsWith3LetterCodes = countryStats?.map((e) => {
                let matchingCountry = countryIds.find(
                    (c: any) => c.a2 === e.country_code
                );
                if (!matchingCountry) {
                    matchingCountry = countryIds.find(
                        (c: any) => c.n === e.country
                    );
                    if (!matchingCountry) {
                        console.warn(
                            `Unknown Country: ${e.country} with code ${e.country_code} had ${e.reads} reads.`
                        );
                        return null;
                    } else {
                        console.warn(
                            `Country: ${e.country} lacked a code, but we found it by searching the name: ${matchingCountry.n}`
                        );
                    }
                }
                maxReads = Math.max(maxReads, e.reads || 0);
                return {
                    id: matchingCountry.a3.toUpperCase(), // 3 letter country code
                    value: distributionFn(e.reads || 0),
                    allReads: e.reads,
                };
            });
            return {
                countries: countriesStatsWith3LetterCodes,
                maxReads: maxReads,
            };
        }, [countryStats, props.stats]) || [];

    // Enhance: it would be great if this was responsive. Although there is a ResponsiveChoropleth component,
    // all that does is use react-measure to listen to the size of the parent, and I found that any wrapper
    // that didn't have an absolute size would cause it to just keep growing. So... needs some css work. For
    // now, just using these constants that work decently.
    const mapWidth = 1000;
    const mapHeight = mapWidth * 0.6;

    return (
        <div
            id="svg-wrapper" // nb: the svg download button looks for this id
            css={css`
                height: ${mapHeight + 0}px;
                width: ${mapWidth}px;
                height: aut;
                border: none;
                border-radius: 5px;
                background-color: white; //#f9fdf9;
                padding: 10px;
                overflow-y: clip; // Enhance: why is this causing overflow anyhow?
            `}
        >
            <h3
                css={css`
                    margin-block-end: 0;
                `}
            >{`Bloom Book Reads by Country from "${props.collection}" Collection`}</h3>
            <div
                css={css`
                    margin-block-start: 0;
                    margin-block-end: 1em;
                `}
            >
                {getPublishableDateRangeString(props.dateRange, false, l10n)}
                <br />
                All Digital Sources: Web, Bloom Reader, Apps.
            </div>
            {/* Note: the Nivo maps, unlike Nivo charts, do not currently have the `layers` attribute that would be needed to easily
            include the title in the SVG. It could be done by modifying the svg dom at download time, but we
            judged that not worth the effort at this time. */}
            <Choropleth
                height={mapHeight}
                width={mapWidth}
                features={countryShapes.features}
                data={data.countries}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                colors={"GnBu"}
                domain={[0, distributionFn(data.maxReads)]}
                unknownColor="#ffffff"
                label="properties.name"
                valueFormat={(reads) => {
                    return formatter.format(reverseDistributionFn(reads));
                }}
                projectionTranslation={[0.45, 0.45]} // the constant here was chosen to fit the map; a different map would require a different value
                projectionScale={mapWidth / 5.2} // the constant here was chosen to fit the map; a different map would require a different value
                projectionType={"naturalEarth1"}
                borderWidth={0.5}
                borderColor="#343d34"
                isInteractive={true}
                tooltip={(tooltipProps) => (
                    <div
                        css={css`
                            background-color: white;
                            border: solid 1px gray;
                            padding: 10px;
                        `}
                    >
                        {`  ${
                            tooltipProps.feature.label ||
                            (tooltipProps.feature as any).properties.name
                        }: ${(
                            tooltipProps.feature.data?.allReads || 0
                        ).toLocaleString()} `}
                    </div>
                )}
                legends={[
                    {
                        anchor: "bottom-left",
                        direction: "column",
                        justify: true,
                        translateX: 50,
                        translateY: -150,
                        itemsSpacing: 0,
                        itemWidth: 85,
                        itemHeight: 18,
                        itemDirection: "left-to-right",
                        symbolSize: 18,
                    },
                ]}
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
                    props.view === "country-table"
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
                            props.view === "country-table"
                                ? "Number of Countries"
                                : "Number of Cities",
                    }}
                />
            </Grid>
        </StatsGridWrapper>
    );
};

// Returns a function (trivial react component) that nivo can use as a layer in svg charts and maps.
// This is better than showing a title using HTML because it is then included in the SVG download.
export function makeSimpleTitleLayer(
    title: string,
    dateRangeInfo: string,
    sourcesInfo: string
) {
    const kLeft = 10;
    return () => (
        <>
            <text
                x={kLeft}
                y={20}
                css={css`
                    font-weight: bold;
                `}
            >
                {title}
            </text>
            <text x={kLeft} y={40}>
                {dateRangeInfo}
            </text>
        </>
    );
}
