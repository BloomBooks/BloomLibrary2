import {
    IStatsProps,
    IDailyBookStat as IDailyBookEventStat,
} from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetDailyBookEventStats(
    props: IStatsProps
): IDailyBookEventStat[] {
    const { response } = useCollectionStats(props, "reading/per-day");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return {
                dateEventLocal: s.datelocal,
                branding: s.bookbranding,
                country: s.country,
                bloomReaderSessions: s.bloomreadersessions,
            };
        });
    return [];
}
