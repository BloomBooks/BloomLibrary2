import { IStatsProps } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";
import * as _ from "lodash";
import { useMemo } from "react";

export interface ICityStat {
    country: string;
    region: string;
    city: string;
    reads: number | undefined;
}

export interface ICountryStat {
    country: string;
    reads: number | undefined;
}

export function useGetLocationStats(
    props: IStatsProps,
    groupByCountry: boolean
): ICityStat[] | ICountryStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/locations");

    const stats = useMemo(() => {
        if (response && response["data"] && response["data"]["stats"]) {
            const cityStats = response["data"]["stats"].map((r: any) => {
                return {
                    city: r.city === "-" ? "UNKNOWN" : r.city,
                    region: r.region === "-" ? "UNKNOWN" : r.region,
                    country: r.country === "-" ? "UNKNOWN" : r.country,
                    reads: parseInt(r.cnt),
                };
            });
            if (groupByCountry) {
                return _.chain(cityStats)
                    .groupBy((entry: any) => entry.country)
                    .map((group, key) => {
                        return {
                            country: key,
                            reads: group.reduce(
                                (previousValue: number, cityEntry: any) =>
                                    previousValue + cityEntry.reads,
                                0
                            ) as number,
                        };
                    })
                    .value();
            }
            return cityStats;
        }

        return undefined;
    }, [groupByCountry, response]);

    return stats;
}
