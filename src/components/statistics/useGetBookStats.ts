import { IStatsProps, IBookStat } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetBookStats(props: IStatsProps): IBookStat[] {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return {
                title: s.booktitle,
                branding: s.bookbranding,
                language: s.language,
                startedCount: s.started,
                finishedCount: s.finished,
            };
        });
    return [];
}

export function useGetBookComprehensionEventStats(
    props: IStatsProps
): IBookStat[] {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return {
                title: s.booktitle,
                branding: s.bookbranding,
                questions: s.numquestionsinbook,
                quizzesTaken: s.numquizzestaken,
                meanCorrect: s.meanpctcorrect,
                medianCorrect: s.medianpctcorrect,
            };
        });
    return [];
}
