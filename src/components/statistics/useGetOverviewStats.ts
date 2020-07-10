import { IStatsProps, IOverviewStats } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetOverviewStats(
    props: IStatsProps
): IOverviewStats | undefined {
    const { response } = useCollectionStats(props, "reading/overview");

    if (response && response["data"] && response["data"]["stats"]) {
        const s = response["data"]["stats"][0];

        // The parseInts are important.
        // Without them, js will treat them like strings even though typescript knows they are numbers.
        // Then the + operator will concatenate instead of add.
        return {
            books: parseInt(s.bookcount, 10),
            languages: parseInt(s.languagecount, 10),

            bloomPubDeviceMobile: parseInt(s.devicecount, 10),

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
