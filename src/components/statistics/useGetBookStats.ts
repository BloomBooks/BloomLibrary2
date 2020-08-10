import { IStatsProps, IBookStat } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

export function useGetBookStats(props: IStatsProps): IBookStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return {
                title: s.booktitle,
                branding: s.bookbranding,
                language: s.language,
                // The parseInts are important.
                // Without them, js will treat the values like strings even though typescript knows they are numbers.
                // Then the + operator will concatenate instead of add.
                startedCount: parseInt(s.started, 10) || 0,
                finishedCount: parseInt(s.finished, 10) || 0,
                shellDownloads: parseInt(s.shelldownloads, 10) || 0,
                pdfDownloads: parseInt(s.pdfdownloads, 10) || 0,
                epubDownloads: parseInt(s.epubdownloads, 10) || 0,
                bloomPubDownloads: parseInt(s.bloompubdownloads, 10) || 0,
            };
        });
    return undefined;
}

export function useGetBookComprehensionEventStats(
    props: IStatsProps
): IBookStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/per-book");

    if (response && response["data"] && response["data"]["stats"])
        return response["data"]["stats"].map((s: any) => {
            return {
                title: s.booktitle,
                branding: s.bookbranding,
                // The parseInts and parseFloats are important.
                // Without them, js will treat the values like strings even though typescript knows they are numbers.
                // Then the + operator will concatenate instead of add.
                questions: parseInt(s.numquestionsinbook, 10),
                quizzesTaken: parseInt(s.numquizzestaken, 10),
                meanCorrect: parseFloat(s.meanpctquestionscorrect),
                medianCorrect: parseFloat(s.medianpctquestionscorrect),
            };
        });
    return undefined;
}
