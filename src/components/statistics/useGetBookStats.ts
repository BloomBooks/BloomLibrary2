import { IStatsProps, IBookStat } from "./StatsInterfaces";
import {
    useCollectionStats,
    extractBookStatFromRawData,
} from "../../connection/LibraryQueryHooks";

export function useGetBookStats(props: IStatsProps): IBookStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return extractBookStatFromRawData(s);
        });
    return undefined;
}

export function useGetBookComprehensionEventStats(
    props: IStatsProps
): IBookStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return extractBookStatFromRawData(s);
        });
    return undefined;
}
