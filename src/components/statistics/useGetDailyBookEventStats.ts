import {
    IStatsProps,
    IDailyBookStat as IDailyBookEventStat,
} from "./StatsInterfaces";

export function useGetDailyBookEventStats(
    props: IStatsProps
): IDailyBookEventStat[] | undefined {
    return getFakeDailyBookEventStats(props);
}

// Temporary for testing
function getFakeDailyBookEventStats(props: IStatsProps): IDailyBookEventStat[] {
    return [
        {
            dateUTC: "2020-01-18T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 2,
        },
        {
            dateUTC: "2020-02-19T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 3,
        },
        {
            dateUTC: "2020-03-20T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 8,
        },
        {
            dateUTC: "2020-04-27T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 40,
        },
        {
            dateUTC: "2020-05-28T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 19,
        },
        {
            dateUTC: "2020-06-18T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 6,
        },
        {
            dateUTC: "2020-06-19T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 12,
        },
        {
            dateUTC: "2020-06-22T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 43,
        },
        {
            dateUTC: "2020-06-23T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 96,
        },
        {
            dateUTC: "2020-06-23T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "United States",
            bloomReaderSessions: 1,
        },
        {
            dateUTC: "2020-06-24T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 87,
        },
        {
            dateUTC: "2020-06-25T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 158,
        },
        {
            dateUTC: "2020-06-26T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 58,
        },
        {
            dateUTC: "2020-06-27T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 41,
        },
        {
            dateUTC: "2020-06-28T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 113,
        },
        {
            dateUTC: "2020-06-28T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Mexico",
            bloomReaderSessions: 1,
        },
        {
            dateUTC: "2020-06-29T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 127,
        },
        {
            dateUTC: "2020-06-30T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Colombia",
            bloomReaderSessions: 3,
        },
        {
            dateUTC: "2020-06-30T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomReaderSessions: 97,
        },
        {
            dateUTC: "2020-06-30T00:00:00.000Z",
            branding: "Juarez-Guatemala",
            country: "United States",
            bloomReaderSessions: 11,
        },
    ].filter((e) => {
        const d = new Date(e.dateUTC);
        return d >= props.start && d <= props.end;
    });
}
