import {
    IStatsProps,
    IDailyBookStat as IDailyBookEventStat,
} from "./StatsInterfaces";
import { useState, useEffect } from "react";
import { IDateRange } from "./DateRangePicker";

export function useGetDailyBookEventStats(
    props: IStatsProps
): IDailyBookEventStat[] | undefined {
    const [results, setResults] = useState<IDailyBookEventStat[]>([]);
    useEffect(() => {
        setResults(getFakeDailyBookEventStats(props));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(props)]);
    return results;
}

// Temporary for testing
function getFakeDailyBookEventStats(props: IStatsProps): IDailyBookEventStat[] {
    return [
        {
            dateEventLocal: "2020-01-18",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 2,
        },
        {
            dateEventLocal: "2020-02-19",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 3,
        },
        {
            dateEventLocal: "2020-03-20",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 8,
        },
        {
            dateEventLocal: "2020-04-27",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 40,
        },
        {
            dateEventLocal: "2020-05-28",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 19,
        },
        {
            dateEventLocal: "2020-06-18",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 6,
        },
        {
            dateEventLocal: "2020-06-19",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 12,
        },
        {
            dateEventLocal: "2020-06-22",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 43,
        },
        {
            dateEventLocal: "2020-06-23",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 96,
        },
        {
            dateEventLocal: "2020-06-23",
            branding: "Juarez-Guatemala",
            country: "United States",
            bloomReaderSessions: 1,
        },
        {
            dateEventLocal: "2020-06-24",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 87,
        },
        {
            dateEventLocal: "2020-06-25",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 158,
        },
        {
            dateEventLocal: "2020-06-26",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 58,
        },
        {
            dateEventLocal: "2020-06-27",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 41,
        },
        {
            dateEventLocal: "2020-06-28",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 113,
        },
        {
            dateEventLocal: "2020-06-28",
            branding: "Juarez-Guatemala",
            country: "Mexico",
            bloomReaderSessions: 1,
        },
        {
            dateEventLocal: "2020-06-29",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 127,
        },
        {
            dateEventLocal: "2020-06-30",
            branding: "Juarez-Guatemala",
            country: "Colombia",
            bloomReaderSessions: 3,
        },
        {
            dateEventLocal: "2020-06-30",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 97,
        },
        {
            dateEventLocal: "2020-06-30",
            branding: "Juarez-Guatemala",
            country: "United States",
            bloomReaderSessions: 11,
        },
    ].filter((e) =>
        // TODO: this is possibly wrong: see documentation on JS Date parsing
        withinDateRange(new Date(e.dateEventLocal), props.dateRange)
    );
}

function withinDateRange(d: Date, range: IDateRange) {
    // todo: handle named ranges.
    if (range.startDate && d < range.startDate) {
        return false;
    }
    if (range.endDate && d > range.endDate) {
        return false;
    }
    return true;
}
