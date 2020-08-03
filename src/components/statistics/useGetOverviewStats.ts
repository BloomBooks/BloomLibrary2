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
            topics: parseInt(s.topiccount, 10),

            bloomPubDeviceMobile: parseInt(s.devicemobilecount, 10),
            bloomPubDevicePC: parseInt(s.devicepccount, 10),

            downloadsEpub: parseInt(s.downloadsepubcount, 10),
            downloadsBloomPub: parseInt(s.downloadsbloompubcount, 10),
            downloadsPDF: parseInt(s.downloadspdfcount, 10),
            downloadsShellbooks: parseInt(s.downloadsshellbookscount, 10),

            readsBloomReader: parseInt(s.readsbloomreadercount, 10),
            readsWeb: parseInt(s.readswebcount, 10),
            readsApps: parseInt(s.readsappscount, 10),
        };
    }
    return undefined;
}
