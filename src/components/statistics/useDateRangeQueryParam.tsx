import { IDateBoundary, IDateRange } from "./DateRangePicker";
import { useQueryParam } from "use-query-params";

// Reads and writes to the browser url with a query param like "end=2020-3-3&start=2010-1-1".
// It depends on App having <QueryParamProvider>

export function useDateRangeQueryParam(): [
    IDateRange,
    (r: IDateRange) => void
] {
    const [start, setStart] = useQueryParam<string | undefined>("start");
    const [end, setEnd] = useQueryParam<string | undefined>("end");
    const toDate = (d: string | undefined) =>
        d && typeof d === "string" ? new Date(d) : undefined;
    const toString = (d: IDateBoundary) =>
        d
            ? `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
            : undefined;

    const range = { startDate: toDate(start), endDate: toDate(end) };
    const setRange = (r: IDateRange) => {
        setStart(toString(r.startDate));
        setEnd(toString(r.endDate));
    };
    return [range, setRange];
}
