import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { getContentfulClient } from "../ContentfulContext";

const defaultContentfulLocale = "en-US";

// Basically a map of queryString (created from query) to the raw Contentful query result.
// This may be the entire set of collections or a single banner definition or any other
// query result from Contentful.
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

    const locale = useGetContentfulBestLocale() || defaultContentfulLocale;

    const queryString = JSON.stringify(query);
    useEffect(() => {
        if (locale === "loading") return;

        if (contentfulCache[queryString]) {
            setResults({
                queryString,
                result: contentfulCache[queryString],
            });
            return;
        }

        getContentfulClient()
            .getEntries({ include: 10, locale, ...query })
            .then((entries: any) => {
                contentfulCache[queryString] = entries.items;
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
    }, [queryString, locale]);

    if (!results || !results.result || results.queryString !== queryString) {
        return { loading: true, result: undefined };
    }

    return { loading: false, result: results.result };
}

function useGetContentfulBestLocale(): string | undefined {
    const currentLocale = useIntl().locale;

    const contentfulLocales = useGetContentfulLocales();
    if (contentfulLocales) {
        if (contentfulLocales.includes(currentLocale)) {
            return currentLocale;
        } else {
            // We didn't find the full locale tag. Try just the part before the dash if there is one.
            const iDash = currentLocale.indexOf("-");
            if (iDash > 0) {
                const langTagOnly = currentLocale.substring(0, iDash);
                if (contentfulLocales.includes(langTagOnly)) return langTagOnly;
            }
            return undefined;
        }
    }
    return "loading";
}

let localesCache: string[] | undefined;
function useGetContentfulLocales(): string[] | undefined {
    // see https://github.com/facebook/react/issues/14981
    const [
        ,
        /*unused*/ dummyToThrowStuffToErrorBoundaryInsideAHook,
    ] = useState();
    const [tempLocalesCache, setLocalesCache] = useState<string[] | undefined>(
        undefined
    );
    if (localesCache) return localesCache;

    getContentfulClient()
        .getLocales()
        .then((results) => {
            //console.log(JSON.stringify(results, null, 4));
            localesCache = results.items.map((l) => l.code);
            // this is needed to wake up react somehow and cause things to re-render
            setLocalesCache(localesCache);
        })
        .catch((err: Error) => {
            console.error(JSON.stringify(err));
            dummyToThrowStuffToErrorBoundaryInsideAHook(() => {
                throw err;
            });
        });

    // Eventually, the "then" above will populate localesCache, cause a refresh,
    // this function will run again, and we will return the populated
    // localesCache. Until then, just return undefined which we treat as the
    // "loading" state.
    return tempLocalesCache;
}
