import { useState, useEffect } from "react";
import { getContentfulClient } from "../ContentfulContext";

export function useContentful(
    query: any
): { loading: boolean; result: any[] | undefined } {
    const [results, setResults] = useState<{
        queryString: string;
        result: any[] | undefined;
    }>({ queryString: "", result: undefined });

    const queryString = JSON.stringify(query);
    useEffect(() => {
        getContentfulClient()
            .getEntries({ include: 10, ...query })
            .then((entries: any) =>
                setResults({ queryString, result: entries.items })
            );
        // We want to depend on query, but not in a way that causes a
        // new http request just because the client's render creates
        // a new object with the same content on each call.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryString]);

    if (!results || !results.result || results.queryString !== queryString) {
        return { loading: true, result: undefined };
    }

    return { loading: false, result: results.result };
}
