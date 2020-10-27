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
    if (contentfulLocales.length) {
        if (contentfulLocales.includes(currentLocale)) {
            return currentLocale;
        } else {
            const iDash = currentLocale.indexOf("-");
            if (iDash > 0) {
                const localeToCheck = currentLocale.substring(0, iDash);
                if (contentfulLocales.includes(localeToCheck))
                    return localeToCheck;
            }
            return undefined;
        }
    }
    return "loading";
}

let localesCache: string[] = [];
function useGetContentfulLocales(): string[] {
    // see https://github.com/facebook/react/issues/14981
    const [
        ,
        /*unused*/ dummyToThrowStuffToErrorBoundaryInsideAHook,
    ] = useState();

    if (localesCache.length) return localesCache;

    getContentfulClient()
        .getLocales()
        .then((results) => (localesCache = results.items.map((l) => l.code)))
        .catch((err: Error) => {
            console.error(JSON.stringify(err));
            dummyToThrowStuffToErrorBoundaryInsideAHook(() => {
                throw err;
            });
        });

    return localesCache;
}
