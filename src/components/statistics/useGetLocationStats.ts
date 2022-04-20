import { IStatsPageProps } from "./StatsInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";
import * as _ from "lodash";
import { useMemo } from "react";

export interface ICityStat {
    country: string;
    region: string;
    city: string;
    city_latitude: string;
    city_longitude: string;
    reads: number | undefined;
}

export interface ICountryStat {
    country: string;
    country_code: string;
    reads: number | undefined;
}

export function useGetLocationStats(
    props: IStatsPageProps,
    groupByCountry: boolean
): ICityStat[] | ICountryStat[] | undefined {
    const { response } = useCollectionStats(props, "reading/locations");

    const mergeTwoRowsBySummingReadsTogether = (
        row1Value: any,
        row2Value: any,
        key: string
    ) => (key === "reads" ? row1Value + row2Value : row1Value);

    const stats = useMemo(() => {
        if (response && response["data"] && response["data"]["stats"]) {
            let cityStats = response["data"]["stats"].map((r: any) => {
                return {
                    city: r.city === "-" ? "UNKNOWN" : r.city,
                    city_latitude: r.city_latitude_gps, // we don't get this if all we have is an IP address
                    city_longitude: r.city_longitude_gps, // we don't get this if all we have is an IP address
                    region: r.region === "-" ? "UNKNOWN" : r.region,
                    country: r.country === "-" ? "UNKNOWN" : r.country,
                    country_code: r.country_code,
                    reads: parseInt(r.cnt),
                };
            });

            // The SQL view currently will give us 2 rows for the same city if some events have latitude/longitude data,
            // while some don't. This is because of how COUNT(*) and GROUPBY work (or our limited SQL savvy).
            cityStats = _.chain(cityStats)
                .groupBy((x) => x.city)
                .map((g) => {
                    if (g.length === 1) {
                        return g[0];
                    } else if (g.length > 2) {
                        console.error(
                            `Did not expect to get more than 2 city entries with the same name: ${g[0].city} x ${g.length}`
                        );
                        return g[0];
                    } else {
                        return _.mergeWith(
                            g[0],
                            g[1],
                            mergeTwoRowsBySummingReadsTogether
                        );
                    }
                })
                .value();

            // Currently we don't have a way to have SQL give us country-wide stats, just city.
            // So we just do the sums here. Seems quick enough.
            if (groupByCountry) {
                return _.chain(cityStats)
                    .groupBy((entry: any) => entry.country_code)
                    .map((entriesWithSameCountryCode, code) => {
                        return {
                            country_code: code,
                            country: entriesWithSameCountryCode[0].country,
                            // sum all the reads for a given country
                            reads: entriesWithSameCountryCode.reduce(
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
