// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState } from "react";

import { useGetCollection } from "../../model/Collections";

import { useDocumentTitle } from "../Routes";
import Select from "@material-ui/core/Select";

import { StatsOverviewScreen } from "./StatsOverviewScreen";
import { ComprehensionQuestionsReport } from "./ComprehensionQuestionsReport";
import { ReaderSessionsChart } from "./ReaderSessionsChart";
import { DateRangePicker, IDateRange } from "./DateRangePicker";
import domtoimage from "dom-to-image-more";
import Button from "@material-ui/core/Button";
import { saveAs } from "file-saver";
import DownloadPngIcon from "./download-png.svg";
import { IStatsProps, ExportDataFn } from "./StatsInterfaces";
import { useStorageState } from "react-storage-hooks";

export interface IScreen {
    label: string;
    component: React.FunctionComponent<IStatsProps>;
}
export const Pretend: React.FunctionComponent<IStatsProps> = (props) => {
    return <h1>Pretend</h1>;
};
const screens: IScreen[] = [
    {
        label: "Overview",
        component: (p: IStatsProps) => <StatsOverviewScreen {...p} />,
    },
    {
        label: "Comprehension Questions",
        component: (p: IStatsProps) => (
            <ComprehensionQuestionsReport {...p}></ComprehensionQuestionsReport>
        ),
    },
    {
        label: "Bloom Reader Sessions",
        component: (p: IStatsProps) => <ReaderSessionsChart {...p} />,
    },
];

export const kStatsPageGray = "#ececec";
export const CollectionStatsPage: React.FunctionComponent<{
    collectionName: string;
}> = (props) => {
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [dataMatrixFn, setDataMatrixFn] = useState<
        ExportDataFn | undefined
    >();
    const [dateRange, setDateRange] = useStorageState<IDateRange>(
        localStorage,
        "analytics-date-range",
        {
            startDate: undefined, // from forever
            endDate: undefined, // today
        }
    );

    // they come back from localStorage as strings.
    if (typeof dateRange.startDate === "string") {
        dateRange.startDate = new Date(dateRange.startDate);
    }
    if (typeof dateRange.endDate === "string") {
        dateRange.endDate = new Date(dateRange.endDate);
    }

    // remains empty (and unused) except in byLanguageGroups mode, when a callback sets it.
    //const [booksAndLanguages, setBooksAndLanguages] = useState("");
    const { collection } = useGetCollection(props.collectionName);
    //const { params, sendIt } = getCollectionAnalyticsInfo(collection);
    useDocumentTitle(collection?.label + " statistics");

    if (!collection) {
        return <div>Collection not found</div>;
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
                    margin-block-start: 0;
                    font-size: 24px;
                    line-height: 28px;
                }
            `}
        >
            <h1>{collection?.label}</h1>
            <h2>Bloom Collection Statistics</h2>
            <div
                css={css`
                    //background-color: ${kStatsPageGray};
                    //height: 75px;
                    /* margin-left: -${kSideMarginPx}px; // push back out to the edge
                    margin-right: -${kSideMarginPx}px; // push back out to the edge */
                    padding-top: 20px;
                    padding-bottom: 20px;
                    /* padding-left: ${kSideMarginPx}px;
                    padding-right: ${kSideMarginPx}px; */
                    display: flex;
                    justify-content: space-between;
                `}
            >
                <Select
                    css={css`
                        padding-left: 0;
                        min-width: 300px;
                        &,
                        * {
                            background-color: white !important;
                        }
                    `}
                    native
                    value={currentScreenIndex}
                    onChange={(e) =>
                        setCurrentScreenIndex(e.target.value as number)
                    }
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

                <DateRangePicker
                    range={dateRange}
                    setRange={(range) => {
                        setDateRange(range);
                    }}
                ></DateRangePicker>
            </div>
            <div
                css={css`
                    width: 100%;
                    background-color: ${kStatsPageGray};
                    margin-left: -${kSideMarginPx}px; // push back out to the edge
                    margin-right: -${kSideMarginPx}px; // push back out to the edge
                    padding: ${kSideMarginPx}px;
                `}
            >
                <div
                    id="screen"
                    css={css`
                        width: fit-content; // this is important for image export, else it may be too wide
                        //background-color: white; // this is important for image export, else it's transparent which will confuse people
                    `}
                >
                    <h3
                        css={css`
                            margin-block-start: 0;
                        `}
                    >
                        {screens[currentScreenIndex].label}
                    </h3>
                    {screens[currentScreenIndex].component({
                        collectionName: props.collectionName,
                        dateRange,
                        registerExportDataFn: (fn: ExportDataFn) => {
                            // this double function is to keep react's use state thing from *running* the function,
                            // which is wants to do!
                            setDataMatrixFn(() => fn);
                            console.log(JSON.stringify(fn()));
                        },
                    })}
                </div>
            </div>
            <div
                css={css`
                    display: flex;
                    justify-content: flex-end;
                `}
            >
                {/* For some reason the resulting SVG file works in browsers but not inkscape, figma, or Affinity.
            <Button
                onClick={() => {
                    domtoimage
                        .toSvg(document.getElementById("screen")!)
                        .then((dataUrl: string) => {
                            saveAs(
                                dataUrl,
                                screens[currentScreenIndex].label + ".svg"
                            );
                        });
                }}
            >
                SVG
            </Button> */}
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
                    <img alt="download PNG" src={DownloadPngIcon} />
                </Button>
                {dataMatrixFn && (
                    <Button
                        onClick={() => {
                            const csv = dataMatrixFn()
                                .map((columnsOfOneRow) => {
                                    return columnsOfOneRow
                                        .map((c) => csvEncode(c))
                                        .join(", ");
                                })
                                .join("\n");
                            //console.log(csv);
                            saveAs(
                                new Blob([csv], {
                                    type: "text/csv;charset=utf-8",
                                }),
                                screens[currentScreenIndex].label + ".csv"
                            );
                        }}
                    >
                        CSV
                    </Button>
                )}
            </div>
            {/*
            <div
                css={css`
                    padding: 10px;
                    height: 100px;
                `}
            >
                <span
                    css={css`
                        font-size: 20px;
                    `}
                >
                    🛈
                </span>
                <h3
                    css={css`
                        display: inline;
                    `}
                >
                    {" "}
                    About this screen
                </h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Mauris praesent praesent pretium dictum ipsum. Consequat,
                    dictumst et lacus condimentum aliquet consequat, vitae in
                    placerat. Dolor ullamcorper.
                </p>
            </div> */}
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
