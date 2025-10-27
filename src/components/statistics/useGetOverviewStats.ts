import { useMemo } from "react";
import { IStatsPageProps, IOverviewStats } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetOverviewStats(
    props: IStatsPageProps
): IOverviewStats | undefined {
    const { response } = useCollectionStats(props, "reading/overview");

    return useMemo(() => {
        if (!(response && response["data"] && response["data"]["stats"])) {
            return undefined;
        }

        const stats = response["data"]["stats"][0];

        if (!stats) {
            const defaultResult: IOverviewStats = {
                booksWithAnalytics: 0,
                languages: 0,
                topics: 0,

                usersWeb: 0,
                usersApps: 0,
                usersBloomReader: 0,
                usersBloomPUBViewer: 0,

                downloadsEpub: 0,
                downloadsBloomPub: 0,
                downloadsPDF: 0,
                downloadsShellbooks: 0,

                readsBloomReader: 0,
                readsWeb: 0,
                readsApps: 0,

                countries: 0,
            };
            return defaultResult;
        }

        // The parseInts are important.
        // Without them, js will treat them like strings even though typescript knows they are numbers.
        // Then the + operator will concatenate instead of add.
        const result: IOverviewStats = {
            booksWithAnalytics: parseInt(stats.bookcount, 10),
            languages: parseInt(stats.languagecount, 10),
            topics: parseInt(stats.topiccount, 10),

            usersWeb: parseInt(stats.userwebcount, 10),
            usersApps: parseInt(stats.userappcount, 10),
            usersBloomReader: parseInt(stats.userbloomreadercount, 10),
            usersBloomPUBViewer: parseInt(stats.userbloompubviewercount, 10),

            downloadsEpub: parseInt(stats.downloadsepubcount, 10),
            downloadsBloomPub: parseInt(stats.downloadsbloompubcount, 10),
            downloadsPDF: parseInt(stats.downloadspdfcount, 10),
            downloadsShellbooks: parseInt(stats.downloadsshellbookscount, 10),

            readsBloomReader: parseInt(stats.readsbloomreadercount, 10),
            readsWeb: parseInt(stats.readswebcount, 10),
            readsApps: parseInt(stats.readsappscount, 10),

            countries: parseInt(stats.countrycount, 10),
        };
        return result;
    }, [response]);
}
