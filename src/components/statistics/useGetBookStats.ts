import { IStatsProps, IBookStat } from "./StatsInterfaces";

export function useGetBookStats(props: IStatsProps): IBookStat[] | undefined {
    return getFakeData(props);
}

function getFakeData(props: IStatsProps): IBookStat[] {
    return [
        {
            title: "(3-6a) The Good Brothers",
            branding: "PNG-RISE",
            questions: 3,
            quizzesTaken: 222,
            meanCorrect: 69,
            medianCorrect: 50,
        },
        {
            title: "(2-6a) Anni's Pineapple",
            branding: "PNG-RISE",
            questions: 3,
            quizzesTaken: 198,
            meanCorrect: 61,
            medianCorrect: 23,
        },
        {
            title: "(3-7a) Pidik Goes To The Market",
            branding: "PNG-RISE",
            questions: 5,
            quizzesTaken: 187,
            meanCorrect: 57,
            medianCorrect: 88,
        },
    ];
}
