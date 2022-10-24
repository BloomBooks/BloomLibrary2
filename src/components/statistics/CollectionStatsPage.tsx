// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState, useMemo, useEffect, ReactNode } from "react";
import ReactDOM from "react-dom";
import { useGetCollection } from "../../model/Collections";

import { useSetBrowserTabTitle } from "../Routes";
import Select from "@material-ui/core/Select";

import { StatsOverviewScreen } from "./StatsOverviewScreen";
import { ComprehensionQuestionsReport } from "./ComprehensionQuestionsReport";
import { ReaderSessionsChart } from "./ReaderSessionsChart";
import { DateRangePicker } from "./DateRangePicker";
import domtoimage from "dom-to-image-more";
import Button from "@material-ui/core/Button";
import { saveAs } from "file-saver";
import DownloadPngIcon from "./download-png.svg";
import DownloadCsvIcon from "../../export/download-csv.svg";
import DownloadSvgIcon from "./download-svg.svg";
import { IStatsPageProps, IScreen, kStatsPageGray } from "./StatsInterfaces";

import { exportCsv, ExportDataFn } from "../../export/exportData";
import LinearProgress from "@material-ui/core/LinearProgress";
import { BookStatsReport } from "./BookStatsReport";
import { useIntl } from "react-intl";
import { QueryDescription } from "./QueryDescription";
import FormControl from "@material-ui/core/FormControl";
import { useGetLocalizedCollectionLabel } from "../../localization/CollectionLabel";
import { ICollectionStatsPageProps } from "./CollectionStatsPageCodeSplit";
import { PageNotFound } from "../PageNotFound";
import { StatsCredits } from "./StatsCredits";
import { StatsLocationScreen } from "./StatsLocationScreen";
import { useHistory } from "react-router-dom";
import { useDateRangeQueryParam } from "./useDateRangeQueryParam";
const SvgSaver = require("svgsaver"); // note: domtoimage has svg export also, but there are problems with what it produces (figma can't load)

export const Pretend: React.FunctionComponent<IStatsPageProps> = (props) => {
    return <h1>Pretend</h1>;
};

// Please use only through the CollectionStatsPageCodeSplit
export const CollectionStatsPage: React.FunctionComponent<ICollectionStatsPageProps> = (
    props
) => {
    const l10n = useIntl();
    const history = useHistory();

    const screens: IScreen[] = useMemo(() => {
        const x = [
            {
                urlKey: "comprehensionQuestions",
                label: l10n.formatMessage({
                    id: "stats.comprehensionQuestions",
                    defaultMessage: "Comprehension Questions",
                }),
                component: (p: IStatsPageProps) => (
                    <ComprehensionQuestionsReport
                        {...p}
                    ></ComprehensionQuestionsReport>
                ),
            },
            {
                urlKey: "bloomReaderSessions",
                label: l10n.formatMessage({
                    id: "stats.bloomReaderSessions",
                    defaultMessage: "Bloom Reader Sessions",
                }),
                component: (p: IStatsPageProps) => (
                    <ReaderSessionsChart {...p} />
                ),
            },
            {
                urlKey: "bookStatistics",
                label: l10n.formatMessage({
                    id: "stats.bookStatistics",
                    defaultMessage: "Book Statistics",
                }),
                component: (p: IStatsPageProps) => (
                    <BookStatsReport {...p}></BookStatsReport>
                ),
            },
            {
                urlKey: "locations-country-map",
                label: l10n.formatMessage({
                    id: "stats.locations-country-map",
                    defaultMessage: "Locations: Country Map",
                }),
                component: (p: IStatsPageProps) => (
                    <StatsLocationScreen
                        {...p}
                        view="country-map"
                    ></StatsLocationScreen>
                ),
            },
            {
                urlKey: "locations-country-table",
                label: l10n.formatMessage({
                    id: "stats.locations-country-table",
                    defaultMessage: "Locations: Country Table",
                }),
                component: (p: IStatsPageProps) => (
                    <StatsLocationScreen
                        {...p}
                        view="country-table"
                    ></StatsLocationScreen>
                ),
            },
            {
                urlKey: "locations-city-table",
                label: l10n.formatMessage({
                    id: "stats.locations-city-table",
                    defaultMessage: "Locations: City Table",
                }),
                component: (p: IStatsPageProps) => (
                    <StatsLocationScreen
                        {...p}
                        view="city-table"
                    ></StatsLocationScreen>
                ),
            },
        ].sort((a, b) => a.label.localeCompare(b.label));
        // But keep the overview at the top, outside of the sort order
        x.unshift({
            urlKey: "overview",
            label: l10n.formatMessage({
                id: "stats.overview",
                defaultMessage: "Overview",
            }),
            component: (p: IStatsPageProps) => <StatsOverviewScreen {...p} />,
        });
        return x;
    }, [l10n]);

    const screenIndex = props.screen
        ? screens.findIndex((s) => s.urlKey === props.screen)
        : 0;

    const [currentScreenIndex, setCurrentScreenIndex] = useState(screenIndex);
    const [screenBackgroundColor, setScreenBackgroundColor] = useState("white");

    // update the URL to reflect navigation within the stats screen so that people can bookmark and share URLs.
    useEffect(() => {
        if (history) {
            const indexOfStats = history.location.pathname.indexOf("/stats");
            const base = history.location.pathname.substring(
                0,
                indexOfStats + 6
            );
            const newUrl =
                currentScreenIndex < 1 // couldn't make sense of the url (-1) or just the overview screen (0)
                    ? base // we don't have "stats/overview", just "stats".
                    : `${base}/${screens[currentScreenIndex].urlKey}`;
            if (newUrl !== history.location.pathname) {
                history.push(newUrl);
            }
        }
    }, [currentScreenIndex, screens, history]);

    const [exportDataFn, setExportDataFn] = useState<
        ExportDataFn | undefined
    >();
    const [waiting, setWaiting] = useState(true);
    const [dateRange, setDateRange] = useDateRangeQueryParam();

    // this will normally be undefined. It gets defined if there is an svg we want to make downloadable
    const svgForDownloading = document.querySelector(
        "#svg-wrapper svg"
    )! as HTMLElement;

    // remains empty (and unused) except in byLanguageGroups mode, when a callback sets it.
    //const [booksAndLanguages, setBooksAndLanguages] = useState("");
    const { collection, loading } = useGetCollection(
        props.collectionName,
        props.filters
    );
    const localizedCollectionLabel = useGetLocalizedCollectionLabel(collection);
    const localizedBrowserTabTitle = l10n.formatMessage(
        {
            id: "collectionStatistics",
            defaultMessage: "Statistics for Collection: {collectionLabel}",
            description:
                "Used to label the statistics for a particular collection. For example, 'Statics for Collection: COVID-19 Books'. {collectionLabel} gets replaced by the name of the collection.",
        },
        { collectionLabel: localizedCollectionLabel }
    );
    useSetBrowserTabTitle(collection ? localizedBrowserTabTitle : undefined);

    if (loading) return null;

    if (!collection) {
        return <PageNotFound />;
    }
    const kSideMarginPx = 20;
    return (
        <div
            css={css`
                margin-left: ${kSideMarginPx}px;
                margin-right: ${kSideMarginPx}px;
                h1 {
                    font-size: 36px;
                    line-height: 28px;
                }
                h2 {
                    //margin-block-start: 0;
                    font-size: 24px;
                    line-height: 28px;
                }
            `}
        >
            <h2>{localizedBrowserTabTitle}</h2>
            <div
                css={css`
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                `}
            >
                <FormControl variant="outlined">
                    <Select
                        css={css`
                            padding-left: 0;
                            min-width: 300px;
                            background-color: white;
                            select {
                                padding: 10px !important;
                            }
                        `}
                        native
                        value={currentScreenIndex}
                        onChange={(e) => {
                            // clear the export function when we switch screens. Let the screen call us back with the new function
                            setExportDataFn(undefined);
                            setCurrentScreenIndex(e.target.value as number);
                        }}
                        inputProps={{
                            name: "age",
                            id: "age-native-simple",
                        }}
                    >
                        {screens.map((screen, index) => (
                            <option key={index} value={index}>
                                {screen.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>
                <div
                    css={css`
                        display: flex;
                        flex-direction: row;
                        gap: 20px;
                    `}
                >
                    {/* let the screen put option controls on the same row as the title using a portal */}
                    <div
                        id="screen-options-portal"
                        css={css`
                            display: flex;
                            flex-direction: row;
                        `}
                    />
                    <DateRangePicker
                        range={dateRange}
                        setRange={(range) => {
                            setDateRange(range);
                        }}
                    ></DateRangePicker>
                </div>
            </div>
            {/* using the fact that no data has been registered with us to know when data is available */}

            {/* show this until data is available */}
            {waiting && (
                <LinearProgress
                    css={css`
                        margin-top: 50px;
                        width: 100%;
                    `}
                />
            )}
            <div
                css={css`
                    /* don't display at all until we have data... in the meantime we are showing the progress bar*/
                    display: ${waiting ? "none" : "block"};
                `}
            >
                <div
                    css={css`
                        width: calc(100% + (${kStatsPageGray} * 2) px);
                        background-color: ${kStatsPageGray};
                        margin-bottom: 10px; // space before download buttons
                    `}
                >
                    <div
                        // This allows horizontal scrolling for the whole 'screen' element...
                        // the chosen block of data. Mainly useful for charts with many columns.
                        css={css`
                            width: 100%;
                            overflow-x: auto;
                            border-radius: 5px;
                            background-color: ${screenBackgroundColor};
                        `}
                    >
                        <div
                            id="screen"
                            css={css`
                                width: fit-content; // this is important for image export, else it may be too wide
                                //background-color: white; // this is important for image export, else it's transparent which will confuse people
                            `}
                        >
                            {screens[currentScreenIndex].component({
                                collection,
                                dateRange,
                                registerExportDataFn: (
                                    fn: ExportDataFn | undefined,
                                    waiting: boolean
                                ) => {
                                    // this double function is to keep react's use state thing from *running* the function,
                                    // which is wants to do!
                                    setExportDataFn(() => fn);
                                    setWaiting(waiting);
                                },
                                setBackgroundColor: setScreenBackgroundColor,
                            })}
                        </div>
                    </div>
                </div>
                <div
                    css={css`
                        display: flex;
                        justify-content: flex-end;
                    `}
                >
                    {svgForDownloading && (
                        <Button
                            onClick={() => {
                                svgForDownloading.setAttribute(
                                    "title",
                                    `${props.collectionName}-${screens[currentScreenIndex].label}`
                                );
                                const svgsaver = new SvgSaver();
                                svgsaver.asSvg(svgForDownloading);
                            }}
                            aria-label="download SVG map"
                        >
                            <img
                                alt={l10n.formatMessage({
                                    id: "stats.download.svgIcon",
                                    defaultMessage: "download SVG map",
                                })}
                                src={DownloadSvgIcon}
                            />
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            downloadAsPng(
                                document.getElementById("screen")!,
                                screens[currentScreenIndex].label + ".png",
                                3
                            );
                        }}
                        aria-label="download PNG image"
                    >
                        <img
                            alt={l10n.formatMessage({
                                id: "stats.download.pngIcon",
                                defaultMessage: "download PNG",
                            })}
                            src={DownloadPngIcon}
                        />
                    </Button>
                    {exportDataFn && (
                        <Button
                            onClick={() =>
                                exportCsv(
                                    screens[currentScreenIndex].label,
                                    exportDataFn
                                )
                            }
                        >
                            <img
                                alt={l10n.formatMessage({
                                    id: "stats.download.csvIcon",
                                    defaultMessage: "download CSV",
                                })}
                                src={DownloadCsvIcon}
                            />
                        </Button>
                    )}
                </div>

                <div
                    css={css`
                        padding: 10px;
                    `}
                >
                    <QueryDescription
                        collection={collection}
                        dateRange={dateRange}
                    />
                </div>
                <div
                    css={css`
                        padding: 10px;
                    `}
                >
                    <StatsCredits />
                </div>
            </div>
        </div>
    );
};
function downloadAsPng(el: HTMLElement, filename: string, scale: number) {
    const props = {
        width: el.clientWidth * scale,
        height: el.clientHeight * scale,
        style: {
            transform: "scale(" + scale + ")",
            "transform-origin": "top left",
        },
    };
    domtoimage.toPng(el, props).then((blob) => {
        saveAs(blob, filename);
    });
}

// This allows screens to add more filter ui controls where we want them.
// It could instead be done with a prop function that we send all components, like `addFilterComponents()`.
export const ScreenOptionsRow: React.FunctionComponent<{}> = (props) => {
    const container = document.getElementById("screen-options-portal");
    return container
        ? ReactDOM.createPortal(
              <>
                  {/* Impose some styling on whatever they gave us so that everything looks the same. */}
                  {React.Children.map(props.children, (x: ReactNode) =>
                      React.cloneElement(x as any, {
                          variant: "outlined",
                          size: "small",
                      })
                  )}
              </>,
              container
          )
        : null;
};

// Returns a function (trivial react component) that nivo can use as a layer in svg charts (but not maps, currently).
// This is better than showing a title using HTML because it is then included in the SVG download.
export function makeSimpleTitleLayer(title: string) {
    return () => (
        <text
            x={10}
            y={-20} // negative to move up into the "margin" so that tall bars cannot reach it
            css={css`
                font-weight: bold;
            `}
        >
            {title}
        </text>
    );
}

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default CollectionStatsPage;
