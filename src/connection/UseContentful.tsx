import { useState, useEffect, useMemo } from "react";
import { getContentfulClient } from "../ContentfulContext";

const contentfulCache: any = {};

export function useContentful(
    query: any
): { loading: boolean; result: any[] | undefined } {
    const [results, setResults] = useState<{
        queryString: string;
        result: any[] | undefined;
    }>({ queryString: "", result: undefined });

    // see https://github.com/facebook/react/issues/14981
    const [
        ,
        /*unused*/ dummyToThrowStuffToErrorBoundaryInsideAHook,
    ] = useState();

    const cache = useMemo(() => contentfulCache, []);

    const queryString = JSON.stringify(query);
    useEffect(() => {
        if (cache[queryString]) {
            setResults({ queryString, result: cache[queryString] });
            return;
        }

        getContentfulClient()
            .getEntries({ include: 10, ...query })
            .then((entries: any) => {
                cache[queryString] = entries.items;
                setResults({ queryString, result: entries.items });
            })
            .catch((err: Error) => {
                console.error(JSON.stringify(err));
                dummyToThrowStuffToErrorBoundaryInsideAHook(() => {
                    throw err;
                });
            });
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
