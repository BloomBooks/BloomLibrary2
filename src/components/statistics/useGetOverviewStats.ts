import { IStatsProps, IOverviewStats } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetOverviewStats(
    props: IStatsProps
): IOverviewStats | undefined {
    const { response } = useCollectionStats(props, "reading/overview");

    if (response && response["data"] && response["data"]["stats"]) {
        const s = response["data"]["stats"][0];

        return {
            books: s.bookcount,
            languages: s.languagecount,

            bloomPubDeviceMobile: s.devicecount,

            // TODO: get these from the database
            topics: 0,

            bloomPubDevicePC: 0,

            downloadsEpub: 0,
            downloadsBloomPub: 0,
            downloadsPDF: 0,
            downloadsShellbooks: 0,

            readsWeb: 0,
            readsApps: 0,
            readsBloomReader: 0,
        };
    }
    return undefined;
}
