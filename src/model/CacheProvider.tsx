import React, { useMemo } from "react";

import {
    useGetTagList,
    useGetCleanedAndOrderedLanguageList,
} from "../connection/LibraryQueryHooks";

import { ILanguage } from "./Language";

interface ICachedTables {
    tags: string[];
    languagesByBookCount: ILanguage[];
}

// for use when we aren't in a react context with hooks
export const CachedTables: ICachedTables = {
    tags: [],
    languagesByBookCount: [],
};

export const CachedTablesContext = React.createContext<ICachedTables>({
    tags: [],
    languagesByBookCount: [],
});

const loadingResult = {
    languagesByBookCount: [],
    tags: [],
};

export const CacheProvider: React.FunctionComponent = (props) => {
    CachedTables.tags = useGetTagList();
    CachedTables.languagesByBookCount = useGetCleanedAndOrderedLanguageList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const resultData =
        CachedTables.tags.length && CachedTables.languagesByBookCount.length
            ? {
                  languagesByBookCount: CachedTables.languagesByBookCount,
                  tags: CachedTables.tags,
              }
            : loadingResult;

    // This trick attempts to avoid re-rendering children between the initial render and
    // when we have ALL the data.
    // It's tempting to NOT render the children at all until we have the data. However,
    // the initial render results in firing off more queries, which potentially could
    // overlap the ones we're waiting for.
    const result = useMemo(
        () => (
            <CachedTablesContext.Provider value={resultData}>
                {props.children}
            </CachedTablesContext.Provider>
        ),
        [resultData, props.children]
    );

    return result;
};

// export const CacheProvider: React.FunctionComponent<{value}> = (props) => {
//     CachedTables.tags = useGetTagList();
//     CachedTables.languagesByBookCount = useGetCleanedAndOrderedLanguageList();

//     return (
//         <CachedTablesContext.Provider value={props.value}>
//             {props.children}
//         </CachedTablesContext.Provider>
//     );
// };

export default CacheProvider;
