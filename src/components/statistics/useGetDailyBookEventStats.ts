import { useMemo } from "react";
import {
    IStatsPageProps,
    IDailyBookStat as IDailyBookEventStat,
} from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetDailyBookEventStats(
    props: IStatsPageProps
): IDailyBookEventStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/per-day");

    return useMemo(() => {
        if (response && response["data"] && response["data"]["stats"]) {
            return response["data"]["stats"].map((s: any) => {
                return {
                    dateEventLocal: s.datelocal,
                    branding: s.bookbranding,
                    country: s.country,
                    // parseInt is important.
                    // Without it, js will treat the values like a strings even though typescript knows they are numbers.
                    // Then the + operator will concatenate instead of add.
                    bloomReaderSessions: parseInt(s.bloomreadersessions, 10),
                };
            });
        }
        return undefined;
    }, [response]);
}
